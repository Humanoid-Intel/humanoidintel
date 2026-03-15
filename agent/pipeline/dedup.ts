/**
 * Deduplication & Scoring Engine
 * Filters duplicate stories and scores newsworthiness
 */

import fs from 'fs'
import path from 'path'
import { config } from '../config'
import type { RawStory } from '../sources/rss'

const SEEN_HASHES_FILE = path.join(__dirname, '../.seen-hashes.json')

function loadSeenHashes(): Set<string> {
  try {
    if (fs.existsSync(SEEN_HASHES_FILE)) {
      const data = JSON.parse(fs.readFileSync(SEEN_HASHES_FILE, 'utf-8'))
      return new Set(data)
    }
  } catch {}
  return new Set()
}

function saveSeenHashes(hashes: Set<string>): void {
  // Keep only last 5000 hashes to prevent unbounded growth
  const arr = Array.from(hashes).slice(-5000)
  fs.writeFileSync(SEEN_HASHES_FILE, JSON.stringify(arr), 'utf-8')
}

function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter((w) => w.length > 3))
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter((w) => w.length > 3))
  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)))
  const union = new Set([...wordsA, ...wordsB])
  return union.size === 0 ? 0 : intersection.size / union.size
}

export interface ScoredStory extends RawStory {
  score: number
  category: 'breaking' | 'deep-dive' | 'market' | 'policy' | 'research'
  detectedCompanies: string[]
}

function scoreStory(story: RawStory): number {
  const text = `${story.title} ${story.summary}`.toLowerCase()
  let score = 0

  // Content type scoring
  if (/raises?|funding|series [abcde]|investment|million|billion|\$\d/.test(text)) {
    score += config.scoring.fundingRound
  } else if (/launch(es|ed)?|announc(es|ed)?|introduces?|reveals?|unveil/.test(text)) {
    score += config.scoring.productLaunch
  } else if (/partner(s|ship)|collaborat|contract|deployment|deploy/.test(text)) {
    score += config.scoring.partnership
  } else if (/hire[sd]?|appoint|join(s|ed)|ceo|cto|vp of/.test(text)) {
    score += config.scoring.executiveHire
  } else if (/paper|research|study|arxiv|ieee|conference|journal/.test(text)) {
    score += config.scoring.researchPaper
  } else if (/opinion|analysis|commentary|perspective|why|how/.test(text)) {
    score += config.scoring.opinionCommentary
  }

  // Humanoid relevance boost
  if (/humanoid|bipedal|figure ai|optimus|digit|atlas|phoenix|apollo|neo beta/.test(text)) {
    score += 20
  }

  // Tracked company boost
  const companies = Object.values(config.trackedCompanies)
  if (companies.some((c) => text.includes(c.toLowerCase()))) {
    score += 15
  }

  // Time decay bonus
  const ageMs = Date.now() - story.publishedAt.getTime()
  const ageHours = ageMs / (1000 * 60 * 60)
  if (ageHours < 24) score += config.scoring.timeDecay24h
  else if (ageHours < 48) score += config.scoring.timeDecay48h

  return Math.min(100, score)
}

function detectCategory(
  story: RawStory,
): 'breaking' | 'deep-dive' | 'market' | 'policy' | 'research' {
  const text = `${story.title} ${story.summary}`.toLowerCase()
  if (/paper|research|arxiv|ieee|algorithm|model|dataset|benchmark/.test(text)) return 'research'
  if (/policy|regulation|osha|iso|safety|compliance|labor|government/.test(text)) return 'policy'
  if (/market|funding|raises?|valuation|tam|investment|vc|capital/.test(text)) return 'market'
  if (/deep dive|analysis|technical|architecture|comparison|explainer/.test(text)) return 'deep-dive'
  return 'breaking'
}

function detectCompanies(story: RawStory): string[] {
  const text = `${story.title} ${story.summary}`.toLowerCase()
  return Object.entries(config.trackedCompanies)
    .filter(([, name]) => text.includes(name.toLowerCase()))
    .map(([, name]) => name)
}

export function deduplicateAndScore(stories: RawStory[]): ScoredStory[] {
  const seenHashes = loadSeenHashes()
  const processedTitles: string[] = []
  const results: ScoredStory[] = []

  for (const story of stories) {
    // Hash-based dedup
    if (seenHashes.has(story.hash)) continue

    // Title similarity dedup (85% threshold)
    const isDuplicate = processedTitles.some(
      (existing) => titleSimilarity(existing, story.title) > 0.85,
    )
    if (isDuplicate) continue

    const score = scoreStory(story)
    if (score < config.scoring.minThreshold) continue

    processedTitles.push(story.title)
    seenHashes.add(story.hash)

    results.push({
      ...story,
      score,
      category: detectCategory(story),
      detectedCompanies: detectCompanies(story),
    })
  }

  // Mark new hashes as seen
  saveSeenHashes(seenHashes)

  // Sort by score descending
  results.sort((a, b) => b.score - a.score)

  console.log(`[Dedup] ${results.length} unique, scoreable stories from ${stories.length} raw`)
  return results.slice(0, config.agent.maxArticlesPerRun)
}
