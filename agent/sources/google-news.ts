/**
 * Google News RSS Source
 * Queries Google News for each tracked company + key humanoid terms.
 * No API key required — uses the public RSS endpoint.
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
  // Company-specific
  '"Figure AI" robot',
  '"Tesla Optimus" humanoid',
  '"Boston Dynamics" Atlas robot',
  '"Agility Robotics" Digit',
  '"1X Technologies" NEO robot',
  '"Sanctuary AI" Phoenix robot',
  '"Apptronik" Apollo robot',
  '"Unitree Robotics" humanoid',
  '"NEURA Robotics" humanoid',
  '"Physical Intelligence" robot',
  '"Fourier Intelligence" robot',
  '"Agibot" humanoid robot',
  '"Kepler Robotics" humanoid',
  '"Clone Robotics" humanoid',
  '"Skild AI" robot',
  // Topic-level
  'humanoid robot deployment 2026',
  'humanoid robot funding round',
  'humanoid robot factory deployment',
  'bipedal robot breakthrough',
  'humanoid robot CEO interview',
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
