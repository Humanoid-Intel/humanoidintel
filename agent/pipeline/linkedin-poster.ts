/**
 * LinkedIn Poster
 *
 * Posts the best story to HumanoidIntelAI LinkedIn once per day.
 * LinkedIn allows longer, more analytical posts than X — each post
 * includes a hook, market context, forward-looking insight, and article link.
 *
 * Two quality gates (same as X poster):
 *   Gate 1 — Hard filters (score, category, age, dedup, daily cap)
 *   Gate 2 — Claude quality judgment
 *
 * Token note: LinkedIn access tokens expire after 60 days.
 * Refresh at: https://www.linkedin.com/developers/apps → your app → Auth
 */

import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config'
import type { ScoredStory } from './dedup'

const POSTED_HASHES_FILE = path.join(__dirname, '../.linkedin-posted-hashes.json')
const DAILY_COUNT_FILE   = path.join(__dirname, '../.linkedin-daily-count.json')

const LI_API = 'https://api.linkedin.com/rest/posts'
const LI_VERSION = '202401'

// ── Dedup helpers ──────────────────────────────────────────────────────────────

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
  const arr = Array.from(hashes).slice(-2000)
  fs.writeFileSync(POSTED_HASHES_FILE, JSON.stringify(arr), 'utf-8')
}

// ── Daily cap helpers ──────────────────────────────────────────────────────────

interface DailyCount { date: string; count: number }

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function loadDailyCount(): DailyCount {
  try {
    if (fs.existsSync(DAILY_COUNT_FILE)) {
      const d = JSON.parse(fs.readFileSync(DAILY_COUNT_FILE, 'utf-8')) as DailyCount
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

// ── Gate 1: Hard filters ───────────────────────────────────────────────────────

function passesHardFilters(story: ScoredStory): { pass: boolean; reason?: string } {
  const { scoreThreshold, maxAgeHours, maxPostsPerDay, categories } = config.linkedInPosting

  if (story.score < scoreThreshold)
    return { pass: false, reason: `score ${story.score} < ${scoreThreshold}` }

  if (!categories.includes(story.category))
    return { pass: false, reason: `category '${story.category}' not in [${categories.join(', ')}]` }

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
  const prompt = `You are the editor of HumanoidIntelAI, a premium humanoid robotics intelligence publication on LinkedIn.

Story title: ${story.title}
Story summary: ${story.summary}

Does this story contain a single striking, SPECIFIC fact — a concrete number, a named company milestone, or a verifiable first — that would make a senior robotics engineer or VC stop scrolling on LinkedIn?

Rules:
- "Company raises funding" with no amount → NO
- "Company raises $150M Series B" → YES
- Vague product teasers with no specs → NO
- Named deployment with unit counts or customer names → YES
- Research paper titles without a clear breakthrough stat → NO
- Market analysis with specific TAM/projection numbers → YES

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

// ── Slug helper ────────────────────────────────────────────────────────────────

function storyToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

// ── URL verification ───────────────────────────────────────────────────────────

async function articleIsLive(slug: string): Promise<boolean> {
  const url = `${config.site.domain}/news/${slug}`
  try {
    const res = await fetch(url, { method: 'HEAD' })
    if (res.ok) return true
    console.log(`[LIposter] ↷ Article not live yet (${res.status}): ${url}`)
    return false
  } catch {
    console.log(`[LIposter] ↷ Could not reach article URL: ${url}`)
    return false
  }
}

// ── Post generation ────────────────────────────────────────────────────────────

async function generatePost(story: ScoredStory, client: Anthropic, articleSlug: string): Promise<string | null> {
  const articleUrl = `${config.site.domain}/news/${articleSlug}`

  const prompt = `Write a LinkedIn post for HumanoidIntelAI about this humanoid robotics story.

Story title: ${story.title}
Story summary: ${story.summary}
Article URL: ${articleUrl}

LinkedIn post rules (ALL must be followed):
1. First line: the single most striking specific fact or number — short, punchy, no fluff
2. Blank line after the first line
3. 2-3 sentences of market context: what does this mean for the industry, customers, or competitors?
4. 1-2 sentences of forward-looking insight: what to watch next, what this unlocks
5. Blank line, then the article URL on its own line
6. Blank line, then 3-4 relevant hashtags: always include #HumanoidRobotics, plus specific ones like #Robotics #FundingNews #PhysicalAI #ManufacturingTech
7. Total length: 800-1200 characters — enough depth for LinkedIn's algorithm, not a wall of text
8. No hype words: "revolutionary", "game-changing", "groundbreaking", "exciting", "thrilled"
9. No questions as openers — lead with the fact
10. Write for VCs, robotics engineers, and corporate strategists

Return ONLY the post text. No explanation, no quotes around it.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })
    return response.content[0].type === 'text' ? response.content[0].text.trim() : null
  } catch {
    return null
  }
}

// ── LinkedIn REST API post ─────────────────────────────────────────────────────

async function publishToLinkedIn(text: string, token: string, authorUrn: string): Promise<string | null> {
  const body = {
    author: authorUrn,
    commentary: text,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  }

  const res = await fetch(LI_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': LI_VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LinkedIn API ${res.status}: ${err}`)
  }

  // LinkedIn returns the post URN in the x-restli-id header
  const postUrn = res.headers.get('x-restli-id') ?? null
  return postUrn
}

// ── Main export ────────────────────────────────────────────────────────────────

export async function postTopStoriesToLinkedIn(
  stories: ScoredStory[],
  slugMap: Map<string, string> = new Map(),
): Promise<void> {
  if (!config.linkedInPosting.enabled) {
    console.log('[LIposter] Disabled (set LINKEDIN_ENABLED=true to enable)')
    return
  }

  if (!config.api.linkedInToken || !config.api.linkedInAuthorUrn) {
    console.log('[LIposter] Missing credentials — skipping (add LINKEDIN_ACCESS_TOKEN and LINKEDIN_AUTHOR_URN to .env.local)')
    return
  }

  const anthropic = new Anthropic({ apiKey: config.api.anthropic })
  const candidates = [...stories].sort((a, b) => b.score - a.score)

  for (const story of candidates) {
    // Gate 1
    const { pass, reason } = passesHardFilters(story)
    if (!pass) {
      console.log(`[LIposter] ↷ Skip "${story.title.slice(0, 60)}" — ${reason}`)
      continue
    }

    // Gate 2
    console.log(`[LIposter] Checking quality: "${story.title.slice(0, 70)}"`)
    const worthy = await isPostWorthy(story, anthropic)
    if (!worthy) {
      console.log('[LIposter] ↷ Claude judged not post-worthy — skipping')
      continue
    }

    // Resolve slug
    const articleSlug = slugMap.get(story.url) || storyToSlug(story.title)

    // Verify article is live
    const live = await articleIsLive(articleSlug)
    if (!live) {
      console.log('[LIposter] ↷ Article not live — skipping to prevent dead link post')
      continue
    }

    // Generate post
    const post = await generatePost(story, anthropic, articleSlug)
    if (!post) {
      console.log('[LIposter] ↷ Post generation failed — skipping')
      continue
    }

    // Publish
    try {
      const postUrn = await publishToLinkedIn(post, config.api.linkedInToken, config.api.linkedInAuthorUrn)
      const postId = postUrn?.split(':').pop() ?? 'unknown'
      console.log(`[LIposter] ✓ Posted: https://www.linkedin.com/feed/update/${postUrn ?? postId}`)
      console.log(`[LIposter] Post:\n${post}`)
      savePostedHash(story.hash)
      incrementDailyCount()
      return
    } catch (err: any) {
      console.error('[LIposter] Post failed:', err?.message ?? err)
      // Try next candidate if this one fails
    }
  }

  console.log('[LIposter] No eligible stories posted this run.')
}
