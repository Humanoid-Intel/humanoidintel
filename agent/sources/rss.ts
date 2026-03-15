/**
 * RSS Feed Aggregator
 * Fetches and parses RSS feeds from robotics news sources
 */

import { config } from '../config'

export interface RawStory {
  title: string
  url: string
  source: string
  publishedAt: Date
  summary: string
  fullText?: string
  hash: string
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

function parseRSSDate(dateStr: string): Date {
  try {
    return new Date(dateStr)
  } catch {
    return new Date()
  }
}

function extractTextFromXML(xml: string, tag: string): string {
  const cdataMatch = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i')
  const plainMatch = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const cdataResult = xml.match(cdataMatch)
  if (cdataResult) return cdataResult[1].trim()
  const plainResult = xml.match(plainMatch)
  if (plainResult) return plainResult[1].replace(/<[^>]+>/g, '').trim()
  return ''
}

async function fetchFeed(feedUrl: string): Promise<RawStory[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': 'humanoidintel.ai/1.0 (news aggregator; contact@humanoidintel.ai)' },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const xml = await response.text()

    // Extract items/entries (RSS 2.0 and Atom)
    const itemPattern = /<item[^>]*>([\s\S]*?)<\/item>|<entry[^>]*>([\s\S]*?)<\/entry>/gi
    const items: RawStory[] = []
    let match

    while ((match = itemPattern.exec(xml)) !== null) {
      const itemXml = match[1] || match[2]

      const title = extractTextFromXML(itemXml, 'title')
      const link =
        itemXml.match(/<link[^>]*href="([^"]+)"/)?.[1] ||
        extractTextFromXML(itemXml, 'link') ||
        ''
      const description =
        extractTextFromXML(itemXml, 'description') ||
        extractTextFromXML(itemXml, 'summary') ||
        extractTextFromXML(itemXml, 'content:encoded') ||
        ''
      const pubDate =
        extractTextFromXML(itemXml, 'pubDate') ||
        extractTextFromXML(itemXml, 'published') ||
        extractTextFromXML(itemXml, 'updated') ||
        new Date().toISOString()

      if (!title || !link) continue

      const cleanSummary = description.replace(/<[^>]+>/g, '').slice(0, 500)
      const hash = simpleHash(title.toLowerCase().replace(/\s+/g, ' ').trim())

      items.push({
        title: title.slice(0, 200),
        url: link,
        source: new URL(feedUrl).hostname,
        publishedAt: parseRSSDate(pubDate),
        summary: cleanSummary,
        hash,
      })
    }

    return items
  } catch (err) {
    console.error(`[RSS] Failed to fetch ${feedUrl}:`, err)
    return []
  }
}

export async function aggregateRSSFeeds(): Promise<RawStory[]> {
  console.log(`[RSS] Fetching ${config.rssFeeds.length} feeds...`)

  const results = await Promise.allSettled(config.rssFeeds.map(fetchFeed))
  const allStories: RawStory[] = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allStories.push(...result.value)
    }
  }

  // Sort by date descending
  allStories.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())

  console.log(`[RSS] Collected ${allStories.length} raw stories`)
  return allStories
}
