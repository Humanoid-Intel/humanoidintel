#!/usr/bin/env tsx
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
import { deduplicateAndScore } from './pipeline/dedup'
import { generateArticles } from './pipeline/writer'
import { publishArticles } from './pipeline/publisher'
import { config } from './config'

async function run() {
  const startTime = Date.now()
  console.log(`\n[humanoidintel.ai Agent] Starting run at ${new Date().toISOString()}`)
  console.log(`[Agent] Mode: ${config.agent.publishMode} | Threshold: ${config.agent.confidenceThreshold}`)

  // Phase 1: Collect stories from all sources
  console.log('\n--- Phase 1: Aggregation ---')
  const [rssStories, arxivPapers] = await Promise.all([
    aggregateRSSFeeds(),
    fetchArxivPapers(10),
  ])
  const allStories = [...rssStories, ...arxivPapers]
  console.log(`[Agent] Total raw stories: ${allStories.length}`)

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
  await publishArticles(articles)

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n[Agent] Run complete in ${elapsed}s`)
}

// Handle uncaught errors gracefully
run().catch((err) => {
  console.error('[Agent] Fatal error:', err)
  process.exit(1)
})
