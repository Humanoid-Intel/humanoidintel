/**
 * Google News RSS Source
 * Queries Google News for every tracked company, topic, region, and key person.
 * No API key required — uses the public RSS endpoint.
 *
 * Coverage: USA, China, Asia, Europe, combat/military, consumer, research
 */

import type { RawStory } from './rss'

const BASE = 'https://news.google.com/rss/search'

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return 'gnews-' + Math.abs(hash).toString(36)
}

const QUERIES = [
  // ── US Companies ──────────────────────────────────────────────────────────
  '"Figure AI" robot',
  '"Tesla Optimus" robot',
  '"Boston Dynamics" robot',
  '"Agility Robotics"',
  '"1X Technologies"',
  '"Sanctuary AI"',
  '"Apptronik" robot',
  '"Unitree Robotics"',
  '"Physical Intelligence"',      // no "robot" qualifier — funding news often omits it
  '"Skild AI"',                   // no "robot" qualifier — "Skild AI raises $X" won't contain "robot"
  '"Clone Robotics"',
  '"Mentee Robotics"',
  '"Kinema Systems"',
  '"Persona AI" humanoid',
  '"Flexion" humanoid robot',
  '"Dyna Robotics"',
  '"Machina Labs" robot',
  '"Mytra" robot',

  // ── European Companies ────────────────────────────────────────────────────
  '"NEURA Robotics"',
  '"Fourier Intelligence"',
  '"Wandercraft" robot',
  '"Halodi Robotics"',
  '"Enchanted Tools" robot',
  '"Automata" robot',
  '"Franka Robotics"',
  '"Anybotics" robot',

  // ── Chinese Companies ─────────────────────────────────────────────────────
  '"Agibot" robot',
  '"Unitree" humanoid',
  '"Kepler Robotics"',
  '"Galbot" robot',
  '"Leju Robotics"',
  '"Zhiyuan Robotics"',
  '"UBTECH" humanoid',
  '"Dorabot" robot',
  '"DeepRobotics"',
  '"Robotics X" Tencent',
  '"Sunday" humanoid robot',
  '"Astribot" robot',
  '"AgiBot" humanoid',
  'humanoid robot China factory',
  'humanoid robot China 2026',
  '"星动纪元" robot',

  // ── Asian Companies (non-China) ───────────────────────────────────────────
  '"Honda Asimo" humanoid',
  '"Toyota" humanoid robot',
  '"Kawasaki" humanoid robot',
  '"Hyundai" humanoid robot',
  '"Samsung" humanoid robot',
  '"LG" humanoid robot',
  '"KAIST" humanoid',
  'humanoid robot Japan 2026',
  'humanoid robot Korea 2026',

  // ── Topic-level: Deployments & Business ───────────────────────────────────
  'humanoid robot factory deployment',
  'humanoid robot warehouse deployment',
  'humanoid robot funding round 2026',
  'humanoid robot commercial deployment',
  'humanoid robot manufacturing scale',
  'humanoid robot startup valuation',
  'humanoid robot investment 2026',
  'humanoid robot contract',
  'humanoid robot partnership',

  // ── Topic-level: Military & Combat ────────────────────────────────────────
  'humanoid robot military',
  'humanoid robot combat',
  '"Phantom MK" robot',
  'robot soldier humanoid',
  'humanoid robot defense',
  'humanoid robot Ukraine',

  // ── Topic-level: Consumer & Household ─────────────────────────────────────
  'humanoid robot home consumer',
  'household humanoid robot 2026',
  'personal humanoid robot',
  'humanoid robot assistant',

  // ── Topic-level: Research & Tech ──────────────────────────────────────────
  'humanoid robot breakthrough',
  'humanoid robot dexterity',
  'humanoid robot walking running',
  'whole-body control humanoid',
  'vision language action robot',
  'sim-to-real humanoid',
  'robot foundation model',
  'humanoid robot AI model',

  // ── Topic-level: Market & Policy ──────────────────────────────────────────
  'humanoid robot market forecast',
  'humanoid robot regulation',
  'humanoid robot safety standards',
  'humanoid robot labor workforce',
  'humanoid robot half marathon race',

  // ── Key People ────────────────────────────────────────────────────────────
  '"Brett Adcock" robot',
  '"Jensen Huang" robot',
  '"Elon Musk" Optimus',
  '"Jim Fan" humanoid',
  '"Chelsea Finn" robot',
  '"Robert Playter" robot',
  '"Gill Pratt" robot',

  // ── General media coverage ────────────────────────────────────────────────
  'humanoid robot news',
  'bipedal robot 2026',
]

async function fetchGoogleNewsQuery(query: string): Promise<RawStory[]> {
  const url = `${BASE}?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'humanoidintel.ai/1.0 news aggregator' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()

    const itemPattern = /<item>([\s\S]*?)<\/item>/gi
    const stories: RawStory[] = []
    let match

    while ((match = itemPattern.exec(xml)) !== null) {
      const item = match[1]
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<[^>]+>/g, '').trim()
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim()
        || item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1]?.trim()
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim()
      const description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]
        ?.replace(/<[^>]+>/g, '').trim() ?? ''
      const source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.trim() ?? 'Google News'

      if (!title || !link) continue

      stories.push({
        title: title.slice(0, 200),
        url: link,
        source,
        publishedAt: pubDate ? new Date(pubDate) : new Date(),
        summary: description.slice(0, 500),
        hash: simpleHash(title.toLowerCase().replace(/\s+/g, ' ').trim()),
      })
    }

    return stories
  } catch {
    return []
  }
}

export async function fetchGoogleNewsStories(): Promise<RawStory[]> {
  console.log(`[GoogleNews] Fetching ${QUERIES.length} queries...`)

  const results = await Promise.allSettled(QUERIES.map(fetchGoogleNewsQuery))
  const all: RawStory[] = []

  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value)
  }

  // Deduplicate by title hash within this source
  const seen = new Set<string>()
  const deduped = all.filter((s) => {
    if (seen.has(s.hash)) return false
    seen.add(s.hash)
    return true
  })

  console.log(`[GoogleNews] Collected ${deduped.length} stories from ${QUERIES.length} queries`)
  return deduped
}
