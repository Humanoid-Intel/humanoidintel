/**
 * arXiv Paper Scanner
 * Monitors cs.RO and cs.AI categories for humanoid-relevant papers
 */

import { config } from '../config'
import type { RawStory } from './rss'

const ARXIV_API = 'https://export.arxiv.org/api/query'

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return 'arxiv-' + Math.abs(hash).toString(36)
}

function isRelevant(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase()
  return config.arxivKeywords.some((kw) => text.includes(kw.toLowerCase()))
}

export async function fetchArxivPapers(maxResults = 20): Promise<RawStory[]> {
  const query = config.arxivKeywords
    .map((kw) => `all:"${kw.replace(/\s+/g, '+')}"`)
    .join('+OR+')
    .slice(0, 200) // API has query length limits

  const params = new URLSearchParams({
    search_query: `cat:cs.RO+AND+(${query})`,
    start: '0',
    max_results: maxResults.toString(),
    sortBy: 'submittedDate',
    sortOrder: 'descending',
  })

  try {
    const res = await fetch(`${ARXIV_API}?${params}`, {
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`arXiv API ${res.status}`)
    const xml = await res.text()

    const stories: RawStory[] = []
    const entryPattern = /<entry>([\s\S]*?)<\/entry>/gi
    let match

    while ((match = entryPattern.exec(xml)) !== null) {
      const entry = match[1]

      const title = entry
        .match(/<title>([\s\S]*?)<\/title>/)?.[1]
        ?.replace(/\s+/g, ' ')
        .trim()
      const summary = entry
        .match(/<summary>([\s\S]*?)<\/summary>/)?.[1]
        ?.replace(/\s+/g, ' ')
        .trim()
      const id = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim()
      const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim()
      const authors: string[] = []
      const authorPattern = /<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/gi
      let authorMatch
      while ((authorMatch = authorPattern.exec(entry)) !== null) {
        authors.push(authorMatch[1].trim())
      }

      if (!title || !summary || !id) continue
      if (!isRelevant(title, summary)) continue

      const arxivUrl = id.replace('http://arxiv.org/abs/', 'https://arxiv.org/abs/')
      const authorStr = authors.slice(0, 3).join(', ') + (authors.length > 3 ? ' et al.' : '')

      stories.push({
        title: `[Research] ${title}`,
        url: arxivUrl,
        source: 'arxiv.org',
        publishedAt: published ? new Date(published) : new Date(),
        summary: `${authorStr ? `${authorStr}. ` : ''}${summary.slice(0, 400)}`,
        hash: simpleHash(id),
      })
    }

    console.log(`[arXiv] Found ${stories.length} relevant papers`)
    return stories
  } catch (err) {
    console.error('[arXiv] Fetch failed:', err)
    return []
  }
}
