/**
 * X (Twitter) Poster
 *
 * Posts the single best breaking news story to @HumanoidIntelAI once per day.
 * Two quality gates before any post is made:
 *
 *   Gate 1 — Hard filters (score, category, age, dedup, daily cap)
 *   Gate 2 — Claude quality judgment ("is there a single striking fact?")
 *
 * Stays within X free-tier limits: 1 post/day = ~30/month (limit: 50/month).
 */

import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { TwitterApi } from 'twitter-api-v2'
import { config } from '../config'
import type { ScoredStory } from './dedup'

const POSTED_HASHES_FILE   = path.join(__dirname, '../.x-posted-hashes.json')
const DAILY_COUNT_FILE     = path.join(__dirname, '../.x-daily-count.json')

// ── Dedup helpers ─────────────────────────────────────────────────────────────

function loadPostedHashes(): Set<string> {
  try {
    if (fs.existsSync(POSTED_HASHES_FILE)) {
      return new Set(JSON.parse(fs.readFileSync(POSTED_HASHES_FILE, 'utf-8')))
    }
  } catch {}
  return new Set()
}

function savePostedHash(hash: string): void {
  const hashes = loadPostedHashes()
  hashes.add(hash)
  // Keep last 2000 hashes
  const arr = Array.from(hashes).slice(-2000)
  fs.writeFileSync(POSTED_HASHES_FILE, JSON.stringify(arr), 'utf-8')
}

// ── Daily cap helpers ─────────────────────────────────────────────────────────

interface DailyCount { date: string; count: number }

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function loadDailyCount(): DailyCount {
  try {
    if (fs.existsSync(DAILY_COUNT_FILE)) {
      const d = JSON.parse(fs.readFileSync(DAILY_COUNT_FILE, 'utf-8')) as DailyCount
      // Reset if it's a new day
      if (d.date === getTodayStr()) return d
    }
  } catch {}
  return { date: getTodayStr(), count: 0 }
}

function incrementDailyCount(): void {
  const d = loadDailyCount()
  d.count++
  d.date = getTodayStr()
  fs.writeFileSync(DAILY_COUNT_FILE, JSON.stringify(d), 'utf-8')
}

// ── Gate 1: Hard filters ──────────────────────────────────────────────────────

function passesHardFilters(story: ScoredStory): { pass: boolean; reason?: string } {
  const { scoreThreshold, maxAgeHours, maxPostsPerDay } = config.xPosting

  if (story.score < scoreThreshold)
    return { pass: false, reason: `score ${story.score} < ${scoreThreshold}` }

  if (story.category !== 'breaking')
    return { pass: false, reason: `category '${story.category}' is not 'breaking'` }

  const ageHours = (Date.now() - new Date(story.publishedAt).getTime()) / 3_600_000
  if (ageHours > maxAgeHours)
    return { pass: false, reason: `${ageHours.toFixed(1)}h old (max ${maxAgeHours}h)` }

  const postedHashes = loadPostedHashes()
  if (postedHashes.has(story.hash))
    return { pass: false, reason: 'already posted' }

  const daily = loadDailyCount()
  if (daily.count >= maxPostsPerDay)
    return { pass: false, reason: `daily cap reached (${daily.count}/${maxPostsPerDay})` }

  return { pass: true }
}

// ── Gate 2: Claude quality judgment ───────────────────────────────────────────

async function isPostWorthy(story: ScoredStory, client: Anthropic): Promise<boolean> {
  const prompt = `You are the editor of @HumanoidIntelAI, a premium humanoid robotics intelligence feed.

Story title: ${story.title}
Story summary: ${story.summary}

Does this story contain a single striking, SPECIFIC fact — a concrete number, a named company milestone, or a verifiable first — that would make a senior robotics engineer or VC stop scrolling?

Rules:
- "Company raises funding" with no amount → NO
- "Company raises $150M Series B" → YES
- Vague product teasers with no specs → NO
- Named deployment with unit counts or customer names → YES
- Research paper titles without a clear breakthrough stat → NO

Answer with exactly one word: YES or NO`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 5,
      messages: [{ role: 'user', content: prompt }],
    })
    const answer = response.content[0].type === 'text' ? response.content[0].text.trim().toUpperCase() : 'NO'
    return answer.startsWith('YES')
  } catch {
    return false
  }
}

// ── Slug helper (mirrors publisher sanitization) ──────────────────────────────

function storyToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

// ── Tweet generation ──────────────────────────────────────────────────────────

async function generateTweet(story: ScoredStory, client: Anthropic): Promise<string | null> {
  const articleUrl = `${config.site.domain}/news/${storyToSlug(story.title)}`

  const prompt = `Write a tweet for @HumanoidIntelAI about this humanoid robotics story.

Story title: ${story.title}
Story summary: ${story.summary}
Article URL: ${articleUrl}

Tweet rules (ALL must be followed):
1. Open with the single most striking specific fact or number — NO "Breaking:" prefix, NO em dashes at start
2. One tight sentence of context (who, what it means)
3. The article URL on its own line
4. End with 1-2 hashtags: always #HumanoidRobotics, plus one specific tag (e.g. #FigureAI, #TeslaOptimus, #Funding)
5. Total length MUST be 280 characters or fewer — count carefully
6. No hype words: "revolutionary", "game-changing", "groundbreaking", "exciting"
7. Write for a senior robotics engineer and VC audience

Return ONLY the tweet text. No explanation, no quotes around it.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })
    const tweet = response.content[0].type === 'text' ? response.content[0].text.trim() : null
    if (!tweet) return null
    // Hard truncation safety — should never be needed if Claude follows rules
    return tweet.length <= 280 ? tweet : tweet.slice(0, 277) + '...'
  } catch {
    return null
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function postTopStoriesToX(stories: ScoredStory[]): Promise<void> {
  if (!config.xPosting.enabled) {
    console.log('[XPoster] Disabled (set X_POSTING_ENABLED=true to enable)')
    return
  }

  const missingCreds = !config.api.twitterApiKey || !config.api.twitterApiSecret ||
                       !config.api.twitterAccessToken || !config.api.twitterAccessSecret
  if (missingCreds) {
    console.log('[XPoster] Missing OAuth credentials — skipping (add TWITTER_API_KEY/SECRET/ACCESS_TOKEN/SECRET to .env.local)')
    return
  }

  const anthropic = new Anthropic({ apiKey: config.api.anthropic })
  const xClient = new TwitterApi({
    appKey: config.api.twitterApiKey,
    appSecret: config.api.twitterApiSecret,
    accessToken: config.api.twitterAccessToken,
    accessSecret: config.api.twitterAccessSecret,
  })

  // Sort by score descending — try best candidate first
  const candidates = [...stories].sort((a, b) => b.score - a.score)

  for (const story of candidates) {
    // Gate 1
    const { pass, reason } = passesHardFilters(story)
    if (!pass) {
      console.log(`[XPoster] ↷ Skip "${story.title.slice(0, 60)}" — ${reason}`)
      continue
    }

    // Gate 2
    console.log(`[XPoster] Checking quality: "${story.title.slice(0, 70)}"`)
    const worthy = await isPostWorthy(story, anthropic)
    if (!worthy) {
      console.log('[XPoster] ↷ Claude judged not post-worthy — skipping')
      continue
    }

    // Generate tweet
    const tweet = await generateTweet(story, anthropic)
    if (!tweet) {
      console.log('[XPoster] ↷ Tweet generation failed — skipping')
      continue
    }

    // Post
    try {
      const { data } = await xClient.v2.tweet(tweet)
      console.log(`[XPoster] ✓ Posted: https://x.com/HumanoidIntelAI/status/${data.id}`)
      console.log(`[XPoster] Tweet:\n${tweet}`)
      savePostedHash(story.hash)
      incrementDailyCount()
      // Stop after first successful post (1/day cap)
      return
    } catch (err: any) {
      console.error('[XPoster] Post failed:', err?.message ?? err)
      // Don't break — try next candidate if posting fails
    }
  }

  console.log('[XPoster] No eligible stories posted this run.')
}
