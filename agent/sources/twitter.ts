/**
 * X / Twitter Source via Nitter RSS
 * Monitors key people and company accounts in the humanoid robotics space.
 * Uses public nitter instances — no API key required.
 *
 * Key people tracked per the humanoidintel.ai brief:
 * Founders, CEOs, lead researchers, journalists, investors
 */

import type { RawStory } from './rss'

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return 'tw-' + Math.abs(hash).toString(36)
}

// Public nitter instances — tried in order until one works
const NITTER_INSTANCES = [
  'https://nitter.poast.org',
  'https://nitter.privacydev.net',
  'https://nitter.1d4.us',
  'https://nitter.kavin.rocks',
]

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
  { handle: 'eeveejenn',        name: 'Jennifer Huddleston (tech policy)' },
  { handle: 'Evan_Ackerman',    name: 'Evan Ackerman (IEEE Spectrum)' },
  // Elon for Optimus signal
  { handle: 'elonmusk',         name: 'Elon Musk (Tesla Optimus)' },
  { handle: 'JensenHuang',      name: 'Jensen Huang (NVIDIA / GR00T)' },
]

async function fetchNitterFeed(handle: string, name: string): Promise<RawStory[]> {
  for (const instance of NITTER_INSTANCES) {
    try {
      const url = `${instance}/${handle}/rss`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'humanoidintel.ai/1.0 news aggregator' },
        signal: AbortSignal.timeout(8000),
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

export async function fetchTwitterSignals(): Promise<RawStory[]> {
  console.log(`[X/Twitter] Monitoring ${ACCOUNTS.length} accounts via nitter...`)

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

  console.log(`[X/Twitter] Got signals from ${successCount}/${ACCOUNTS.length} accounts, ${all.length} posts total`)
  return all
}
