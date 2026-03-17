#!/usr/bin/env tsx
/**
 * Weekly Digest Generator
 *
 * Generates a weekly newsletter edition from the past 7 days of articles.
 * Intended to run every Sunday via scheduled task.
 *
 * Usage: npx tsx agent/scripts/weekly-digest.ts
 */

import { config as dotenv } from 'dotenv'
import { resolve, join } from 'path'
dotenv({ path: resolve(__dirname, '../../.env.local'), override: true })

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import matter from 'gray-matter'

const contentRoot = resolve(__dirname, '../../content')
const anthropic = new Anthropic()

interface ArticleSummary {
  title: string
  slug: string
  date: string
  category: string
  excerpt: string
  tags: string[]
}

function getRecentArticles(days: number = 7): ArticleSummary[] {
  const newsDir = join(contentRoot, 'news')
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const files = fs.readdirSync(newsDir).filter((f) => f.endsWith('.md'))
  const articles: ArticleSummary[] = []

  for (const file of files) {
    try {
      const raw = fs.readFileSync(join(newsDir, file), 'utf-8')
      const { data } = matter(raw)
      const date = new Date(data.date)
      if (date >= cutoff) {
        articles.push({
          title: data.title ?? '',
          slug: file.replace('.md', ''),
          date: data.date ?? '',
          category: data.category ?? 'market',
          excerpt: data.excerpt ?? '',
          tags: data.tags ?? [],
        })
      }
    } catch {
      /* skip malformed files */
    }
  }

  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function getRecentFundingRounds(days: number = 7) {
  try {
    const raw = fs.readFileSync(join(contentRoot, 'data/funding-rounds.json'), 'utf-8')
    const rounds = JSON.parse(raw)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return rounds.filter((r: any) => r.date && new Date(r.date) >= cutoff)
  } catch {
    return []
  }
}

function getEditionNumber(): number {
  const newsletterDir = join(contentRoot, 'newsletter')
  if (!fs.existsSync(newsletterDir)) return 1
  const files = fs.readdirSync(newsletterDir).filter((f) => f.endsWith('.md'))
  let maxEdition = 0
  for (const file of files) {
    try {
      const raw = fs.readFileSync(join(newsletterDir, file), 'utf-8')
      const { data } = matter(raw)
      if (data.edition && data.edition > maxEdition) maxEdition = data.edition
    } catch { /* skip */ }
  }
  return maxEdition + 1
}

async function generateDigest() {
  const articles = getRecentArticles(7)
  const fundingRounds = getRecentFundingRounds(7)

  if (articles.length === 0) {
    console.log('[Digest] No articles from the past 7 days. Skipping.')
    return
  }

  console.log(`[Digest] Found ${articles.length} articles and ${fundingRounds.length} funding rounds from the past week`)

  // Group articles by category
  const byCategory: Record<string, ArticleSummary[]> = {}
  for (const a of articles) {
    const cat = a.category || 'market'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(a)
  }

  const categoryBreakdown = Object.entries(byCategory)
    .map(([cat, items]) => `${cat}: ${items.length} articles`)
    .join(', ')

  const articleList = articles
    .slice(0, 30) // Cap at 30 for prompt size
    .map((a) => `- [${a.category.toUpperCase()}] "${a.title}" (${a.date.slice(0, 10)}) — ${a.excerpt}`)
    .join('\n')

  const fundingList =
    fundingRounds.length > 0
      ? fundingRounds
          .map((r: any) => `- ${r.company}: ${r.amount} ${r.round} (${r.date})`)
          .join('\n')
      : 'No new funding rounds this week.'

  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 7)
  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  const edition = getEditionNumber()

  const prompt = `You are the editor of the HumanoidIntel Weekly Brief — a Friday digest for operators, investors, and engineers in humanoid robotics. Write edition #${edition} covering the week of ${weekLabel}.

Here are the articles published this week (${articles.length} total, ${categoryBreakdown}):

${articleList}

Funding rounds this week:
${fundingList}

Write a newsletter in markdown with this structure:
1. A compelling 1-sentence opening line (no "Good morning" or greetings)
2. 3-5 numbered sections covering the MOST IMPORTANT stories of the week, with analysis (not just summaries)
3. A "Quick Hits" bullet list for notable items that don't warrant full sections
4. A "Numbers" section with 3-5 key data points from the week
5. A brief closing line

Style guide:
- Write like a Bloomberg/Stratechery analyst, not a blogger
- Be opinionated — take positions on what matters and why
- Reference specific numbers, companies, and implications
- Each section should be 2-3 paragraphs max
- Total length: 800-1200 words
- Do NOT use emojis
- Do NOT include a subject line or title — that will be generated from the content`

  console.log('[Digest] Generating newsletter with Claude...')
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const digestContent = (response.content[0] as any).text as string

  // Generate title from first section
  const titlePrompt = `Based on this weekly newsletter, write a concise newsletter title (under 80 chars) in this format: "Weekly Brief: [2-3 key topics separated by commas]". Return ONLY the title, nothing else.

${digestContent.slice(0, 500)}`

  const titleResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [{ role: 'user', content: titlePrompt }],
  })

  const title = ((titleResponse.content[0] as any).text as string).trim().replace(/^["']|["']$/g, '')

  // Format date for slug
  const dateStr = today.toISOString().slice(0, 10)
  const slug = `${dateStr}-weekly-brief`

  const frontmatter = `---
title: "${title}"
slug: "${slug}"
date: "${today.toISOString()}"
excerpt: "${digestContent.split('\n').find((l: string) => l.trim().length > 20)?.trim().slice(0, 150) ?? 'Weekly intelligence digest for humanoid robotics.'}"
edition: ${edition}
---`

  const fullContent = `${frontmatter}\n\n${digestContent}\n`

  // Save
  const newsletterDir = join(contentRoot, 'newsletter')
  if (!fs.existsSync(newsletterDir)) fs.mkdirSync(newsletterDir, { recursive: true })
  const filePath = join(newsletterDir, `${slug}.md`)
  fs.writeFileSync(filePath, fullContent)

  console.log(`[Digest] Published: ${filePath}`)
  console.log(`[Digest] Title: ${title}`)
  console.log(`[Digest] Edition: #${edition}`)
  console.log(`[Digest] Articles covered: ${articles.length}`)
}

generateDigest().catch((err) => {
  console.error('[Digest] Fatal error:', err)
  process.exit(1)
})
