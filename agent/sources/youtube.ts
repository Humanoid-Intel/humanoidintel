/**
 * YouTube RSS Source
 * Monitors official company channels + key researcher/journalist channels.
 * No API key required — YouTube exposes public RSS per channel ID.
 */

import type { RawStory } from './rss'

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return 'yt-' + Math.abs(hash).toString(36)
}

// Format: { name, channelId }
const CHANNELS = [
  // Official company channels
  { name: 'Figure AI',           channelId: 'UCY-VKMNJ0KNq1fBB4Dm2Y3A' },
  { name: 'Boston Dynamics',     channelId: 'UC7vVhkEfw4nOGp8TyDh7uPQ' },
  { name: 'Agility Robotics',    channelId: 'UCAlKfMkbwDSXAi5PsBMIwSg' },
  { name: 'Unitree Robotics',    channelId: 'UCsMgNwMmFfciIJhiOiJCbMA' },
  { name: 'Apptronik',           channelId: 'UCpIyIHkqPTUwzBzpBr33YXA' },
  { name: '1X Technologies',     channelId: 'UCbdQN_kL5GbMtKzGqzXDz0A' },
  { name: 'Fourier Intelligence', channelId: 'UCWbsrH0YYMkaxZ5xnlZrHHQ' },
  { name: 'NEURA Robotics',      channelId: 'UC6GsIHn6EZkYELT9hWvHlWw' },
  { name: 'Sanctuary AI',        channelId: 'UCvFSH7WEDilbNQCgdyH_fWw' },
  { name: 'Tesla AI',            channelId: 'UCc-1NW1E8uFRwEMEnJJNJOA' },
  // Key researchers & journalists
  { name: 'Two Minute Papers',   channelId: 'UCbfYPyITQ-7l4upoX8nvctg' },
  { name: 'IEEE Spectrum',       channelId: 'UCo3LEFEndyWIlJuOuLiaqHg' },
  { name: 'Lex Fridman',         channelId: 'UCSHZKyawb77ixDdsGog4iWA' },
]

async function fetchYouTubeChannel(name: string, channelId: string): Promise<RawStory[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'humanoidintel.ai/1.0 news aggregator' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()

    const entryPattern = /<entry>([\s\S]*?)<\/entry>/gi
    const stories: RawStory[] = []
    let match

    while ((match = entryPattern.exec(xml)) !== null) {
      const entry = match[1]
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim()
      const link = entry.match(/<link[^>]+href="([^"]+)"/)?.[1]?.trim()
      const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim()
      const description = entry.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1]
        ?.replace(/<[^>]+>/g, '').trim() ?? ''

      if (!title || !link) continue

      stories.push({
        title: `[Video] ${title}`.slice(0, 200),
        url: link,
        source: `YouTube / ${name}`,
        publishedAt: published ? new Date(published) : new Date(),
        summary: description.slice(0, 500) || `New video from ${name}`,
        hash: simpleHash(link),
      })
    }

    return stories
  } catch {
    return []
  }
}

export async function fetchYouTubeVideos(): Promise<RawStory[]> {
  console.log(`[YouTube] Fetching ${CHANNELS.length} channels...`)

  const results = await Promise.allSettled(
    CHANNELS.map((c) => fetchYouTubeChannel(c.name, c.channelId))
  )
  const all: RawStory[] = []

  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value)
  }

  console.log(`[YouTube] Collected ${all.length} videos`)
  return all
}
