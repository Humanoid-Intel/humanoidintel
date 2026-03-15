/**
 * X / Twitter Source
 *
 * Strategy (in order of preference):
 * 1. Official Twitter v2 API — if TWITTER_BEARER_TOKEN is set in .env.local
 *    Get it free at developer.twitter.com (Basic tier: $100/month for full coverage;
 *    Free tier works for search but NOT user timelines)
 * 2. Nitter RSS fallback — public instances, no API key needed
 *    Note: Most nitter instances are blocked by X as of 2025. Coverage may be 0.
 *
 * Key people tracked per the humanoidintel.ai brief:
 * Founders, CEOs, lead researchers, journalists, investors
 */

import type { RawStory } from './rss'
import { config } from '../config'

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return 'tw-' + Math.abs(hash).toString(36)
}

// ─── Account list ──────────────────────────────────────────────────────────────

const ACCOUNTS = [
  // Company founders & CEOs
  { handle: 'adaborobotics',    name: 'Brett Adcock (Figure AI CEO)' },
  { handle: 'RobertPlayter',    name: 'Robert Playter (Boston Dynamics CEO)' },
  { handle: 'damion_shelton',   name: 'Damion Shelton (Agility Robotics CEO)' },
  { handle: 'ericrosenblum',    name: 'Eric Rosenblum (1X Technologies)' },
  { handle: 'geordie_rose',     name: 'Geordie Rose (Sanctuary AI CEO)' },
  { handle: 'jeff_cardenas_',   name: 'Jeff Cardenas (Apptronik CEO)' },
  { handle: 'aidapaolucci',     name: 'Aida Paolucci (NEURA Robotics)' },
  // Key researchers
  { handle: 'realDrJimFan',     name: 'Jim Fan (NVIDIA GR00T lead)' },
  { handle: 'chelseabfinn',     name: 'Chelsea Finn (Stanford / PI)' },
  { handle: 'hausman_k',        name: 'Karol Hausman (Google DeepMind)' },
  { handle: 'pieterabbeel',     name: 'Pieter Abbeel (Berkeley / Covariant)' },
  { handle: 'svlevine',         name: 'Sergey Levine (Berkeley)' },
  { handle: 'ankurhandos',      name: 'Ankur Handa (NVIDIA robotics)' },
  { handle: 'lerrelp',          name: 'Lerrel Pinto (NYU robotics)' },
  // Investors
  { handle: 'Jeff_Linnell',     name: 'Jeff Linnell (humanoid investor)' },
  { handle: 'saranormous',      name: 'Sarah Guo (Conviction Capital)' },
  // Official company accounts
  { handle: 'Figure_robot',     name: 'Figure AI (official)' },
  { handle: 'AgilityRobotics',  name: 'Agility Robotics (official)' },
  { handle: 'BostonDynamics',   name: 'Boston Dynamics (official)' },
  { handle: 'apptronik',        name: 'Apptronik (official)' },
  { handle: 'UnitreeRobotics',  name: 'Unitree Robotics (official)' },
  { handle: 'sanctuaryai',      name: 'Sanctuary AI (official)' },
  { handle: 'NEURARobotics',    name: 'NEURA Robotics (official)' },
  { handle: 'CloneRobotics',    name: 'Clone Robotics (official)' },
  { handle: 'physical_int',     name: 'Physical Intelligence (official)' },
  // Journalists & analysts
  { handle: 'mrmorrissey',      name: 'Brian Heater (TechCrunch robotics)' },
  { handle: 'Evan_Ackerman',    name: 'Evan Ackerman (IEEE Spectrum)' },
  // Industry titans
  { handle: 'elonmusk',         name: 'Elon Musk (Tesla Optimus)' },
  { handle: 'JensenHuang',      name: 'Jensen Huang (NVIDIA / GR00T)' },
]

// ─── Twitter v2 API (Official) ──────────────────────────────────────────────

const TWITTER_API_BASE = 'https://api.twitter.com/2'

// Keywords that signal a tweet is worth tracking
const SIGNAL_KEYWORDS = /humanoid|robot|bipedal|optimus|atlas|digit|apollo|figure|agility|unitree|boston dynamics|1x|neura|sanctuary|apptronik|locomotive|manipulat|actuator|sim.to.real|deployment|funding|raise|launch|demo|breakthrough/i

async function fetchTwitterV2(handles: string[], bearerToken: string): Promise<RawStory[]> {
  const stories: RawStory[] = []

  // Build a search query: tweets from any of these accounts mentioning robotics
  const fromQuery = handles.map(h => `from:${h}`).join(' OR ')
  const query = `(${fromQuery}) lang:en -is:retweet`

  const url = new URL(`${TWITTER_API_BASE}/tweets/search/recent`)
  url.searchParams.set('query', query)
  url.searchParams.set('max_results', '100')
  url.searchParams.set('tweet.fields', 'created_at,author_id,entities,text')
  url.searchParams.set('expansions', 'author_id')
  url.searchParams.set('user.fields', 'username,name')

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'User-Agent': 'humanoidintel.ai/1.0',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`[X/Twitter] API error ${res.status}: ${body.slice(0, 200)}`)
      return []
    }

    const data = await res.json() as {
      data?: Array<{ id: string; text: string; created_at: string; author_id: string }>
      includes?: { users?: Array<{ id: string; username: string; name: string }> }
      meta?: { result_count: number }
    }

    if (!data.data) return []

    // Build a user lookup map
    const userMap = new Map<string, { username: string; name: string }>()
    for (const u of data.includes?.users ?? []) {
      userMap.set(u.id, { username: u.username, name: u.name })
    }

    for (const tweet of data.data) {
      // Only keep tweets that mention robotics topics
      if (!SIGNAL_KEYWORDS.test(tweet.text)) continue

      const user = userMap.get(tweet.author_id)
      const handle = user?.username ?? tweet.author_id
      const displayName = user?.name ?? handle
      const accountInfo = ACCOUNTS.find(a => a.handle.toLowerCase() === handle.toLowerCase())
      const name = accountInfo?.name ?? displayName

      stories.push({
        title: `[X] ${name}: ${tweet.text.slice(0, 150)}`,
        url: `https://x.com/${handle}/status/${tweet.id}`,
        source: `X / @${handle}`,
        publishedAt: new Date(tweet.created_at),
        summary: tweet.text,
        hash: simpleHash(`tw2-${tweet.id}`),
      })
    }

    return stories
  } catch (err) {
    console.error('[X/Twitter] API fetch error:', err)
    return []
  }
}

// ─── Nitter RSS Fallback ─────────────────────────────────────────────────────

// Public nitter instances — tried in order until one works
// Note: Most are blocked by X as of 2025. Add new instances as they appear.
const NITTER_INSTANCES = [
  'https://nitter.poast.org',
  'https://nitter.privacydev.net',
  'https://nitter.1d4.us',
  'https://nitter.kavin.rocks',
  'https://nitter.cz',
  'https://nitter.nl',
  'https://nitter.mint.lgbt',
  'https://nitter.esmailelbob.xyz',
  'https://nitter.sethforprivacy.com',
  'https://nitter.rawbit.ninja',
]

async function fetchNitterFeed(handle: string, name: string): Promise<RawStory[]> {
  for (const instance of NITTER_INSTANCES) {
    try {
      const url = `${instance}/${handle}/rss`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'humanoidintel.ai/1.0 news aggregator' },
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) continue
      const xml = await res.text()
      if (!xml.includes('<item>')) continue

      const itemPattern = /<item>([\s\S]*?)<\/item>/gi
      const stories: RawStory[] = []
      let match

      while ((match = itemPattern.exec(xml)) !== null) {
        const item = match[1]
        const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]
          ?.replace(/<!\[CDATA\[|\]\]>/g, '').trim()
        const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim()
          || item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1]?.trim()
        const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim()
        const description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]
          ?.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim() ?? ''

        if (!title || !link || title.includes('Pinned')) continue
        // Skip replies (start with @)
        if (description.trim().startsWith('@')) continue
        // Only keep robotics-relevant content
        if (!SIGNAL_KEYWORDS.test(title + ' ' + description)) continue

        stories.push({
          title: `[X] ${name}: ${title.slice(0, 150)}`,
          url: link,
          source: `X / @${handle}`,
          publishedAt: pubDate ? new Date(pubDate) : new Date(),
          summary: description.slice(0, 500),
          hash: simpleHash(link + title),
        })
      }

      return stories
    } catch {
      continue // try next instance
    }
  }
  return [] // all instances failed — silent fail
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function fetchTwitterSignals(): Promise<RawStory[]> {
  const bearerToken = config.api.twitterBearer

  // Strategy 1: Official Twitter v2 API
  if (bearerToken) {
    console.log(`[X/Twitter] Using official API (${ACCOUNTS.length} accounts)...`)
    // Split into batches of 25 (API query length limit)
    const handles = ACCOUNTS.map(a => a.handle)
    const batch1 = handles.slice(0, 25)
    const batch2 = handles.slice(25)

    const [r1, r2] = await Promise.all([
      fetchTwitterV2(batch1, bearerToken),
      batch2.length > 0 ? fetchTwitterV2(batch2, bearerToken) : Promise.resolve([]),
    ])
    const all = [...r1, ...r2]
    console.log(`[X/Twitter] Official API: ${all.length} relevant posts`)
    return all
  }

  // Strategy 2: Nitter RSS fallback
  console.log(`[X/Twitter] No bearer token — trying nitter fallback (${ACCOUNTS.length} accounts)...`)
  console.log(`[X/Twitter] To enable full X coverage, set TWITTER_BEARER_TOKEN in .env.local`)
  console.log(`[X/Twitter] Get a free token at: https://developer.twitter.com/en/portal/dashboard`)

  const results = await Promise.allSettled(
    ACCOUNTS.map((a) => fetchNitterFeed(a.handle, a.name))
  )
  const all: RawStory[] = []
  let successCount = 0

  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.length > 0) {
      all.push(...r.value)
      successCount++
    }
  }

  if (successCount === 0) {
    console.log(`[X/Twitter] All nitter instances blocked. Set TWITTER_BEARER_TOKEN for X coverage.`)
  } else {
    console.log(`[X/Twitter] Nitter: ${successCount}/${ACCOUNTS.length} accounts, ${all.length} posts`)
  }

  return all
}
