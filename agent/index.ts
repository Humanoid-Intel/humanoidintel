#!/usr/bin/env tsx
import { config as dotenv } from 'dotenv'
import { resolve } from 'path'
dotenv({ path: resolve(__dirname, '../.env.local'), override: true })

/**
 * humanoidintel.ai — Autonomous Content Agent
 *
 * Orchestrates the full pipeline:
 * 1. Aggregate RSS feeds + arXiv papers
 * 2. Deduplicate and score stories
 * 3. Generate articles with Claude
 * 4. Publish to content/drafts/ or content/news/
 *
 * Run: npx tsx agent/index.ts
 * Schedule: Add to cron — 0 * * * * (hourly)
 */

import { aggregateRSSFeeds } from './sources/rss'
import { fetchArxivPapers } from './sources/arxiv'
import { fetchGoogleNewsStories } from './sources/google-news'
import { fetchYouTubeVideos } from './sources/youtube'
import { fetchTwitterSignals } from './sources/twitter'
import { deduplicateAndScore } from './pipeline/dedup'
import { extractAndSaveFundingRounds } from './pipeline/funding-extractor'
import { generateArticles } from './pipeline/writer'
import { publishArticles } from './pipeline/publisher'
import { postTopStoriesToX } from './pipeline/x-poster'
import { config } from './config'

async function run() {
  const startTime = Date.now()
  console.log(`\n[humanoidintel.ai Agent] Starting run at ${new Date().toISOString()}`)
  console.log(`[Agent] Mode: ${config.agent.publishMode} | Threshold: ${config.agent.confidenceThreshold}`)

  // Phase 1: Collect stories from all sources
  console.log('\n--- Phase 1: Aggregation ---')
  const [rssStories, arxivPapers, googleNewsStories, youtubeVideos, twitterSignals] = await Promise.all([
    aggregateRSSFeeds(),
    fetchArxivPapers(10),
    fetchGoogleNewsStories(),
    fetchYouTubeVideos(),
    fetchTwitterSignals(),
  ])
  const allStories = [...rssStories, ...arxivPapers, ...googleNewsStories, ...youtubeVideos, ...twitterSignals]
  console.log(`[Agent] Total raw stories: ${allStories.length} (RSS: ${rssStories.length} | arXiv: ${arxivPapers.length} | GoogleNews: ${googleNewsStories.length} | YouTube: ${youtubeVideos.length} | X: ${twitterSignals.length})`)

  // Phase 2: Deduplicate and score
  console.log('\n--- Phase 2: Deduplication & Scoring ---')
  const scoredStories = deduplicateAndScore(allStories)

  if (scoredStories.length === 0) {
    console.log('[Agent] No new stories to process. Exiting.')
    return
  }

  console.log(`[Agent] Processing top ${scoredStories.length} stories:`)
  scoredStories.forEach((s, i) => {
    console.log(`  ${i + 1}. [${s.score}] ${s.title.slice(0, 70)}`)
  })

  // Phase 2.5: Extract funding rounds from funding-related stories
  console.log('\n--- Phase 2.5: Funding Extraction ---')
  await extractAndSaveFundingRounds(scoredStories)

  // Phase 3: Generate articles with Claude
  console.log('\n--- Phase 3: Content Generation ---')
  if (!config.api.anthropic) {
    console.error('[Agent] ANTHROPIC_API_KEY not set. Set it in .env.local to enable content generation.')
    console.log('[Agent] Saving scored stories list for manual review...')

    const reviewList = scoredStories.map(s => `Score: ${s.score} | ${s.category} | ${s.title}\nURL: ${s.url}\n`).join('\n')
    const { writeFileSync } = await import('fs')
    const { join } = await import('path')
    writeFileSync(join(__dirname, '../content/drafts/pending-review.txt'), reviewList)
    return
  }

  const articles = await generateArticles(scoredStories)
  console.log(`[Agent] Generated ${articles.length}/${scoredStories.length} articles`)

  // Phase 4: Publish
  console.log('\n--- Phase 4: Publishing ---')
  const slugMap = await publishArticles(articles)

  // Phase 4.5: Post best breaking story to X (1/day max, score 95+)
  console.log('\n--- Phase 4.5: X Posting ---')
  await postTopStoriesToX(scoredStories, slugMap)

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n[Agent] Run complete in ${elapsed}s`)
}

// Handle uncaught errors gracefully
run().catch((err) => {
  console.error('[Agent] Fatal error:', err)
  process.exit(1)
})
