#!/usr/bin/env tsx
/**
 * Manual LinkedIn Post
 * Posts a specific article to LinkedIn, bypassing the age gate.
 * Use this to seed the first post or to manually feature a story.
 *
 * Usage:
 *   npx tsx agent/scripts/manual-linkedin-post.ts
 */

import { config as dotenv } from 'dotenv'
import { resolve } from 'path'
dotenv({ path: resolve(__dirname, '../../.env.local'), override: true })

import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config'

const LI_API     = 'https://api.linkedin.com/rest/posts'
const LI_VERSION = '202503'
const POSTED_HASHES_FILE = path.join(__dirname, '../.linkedin-posted-hashes.json')

// ── Story to post ─────────────────────────────────────────────────────────────

const STORY = {
  title:   'Apptronik Raises $520M Extension for Apollo Humanoid Production',
  summary: 'Austin-based Apptronik extends Series A to $935M total — the largest single round in humanoid robotics history. Apollo targets warehouse and manufacturing use cases with 8-hour continuous operation, hot-swappable batteries, and 55-pound payload capacity. Funding will accelerate production scale-up.',
  slug:    'apptronik-520m-series-a-extension-apollo-production',
  hash:    'apptronik-520m-manual',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadPostedHashes(): Set<string> {
  try {
    if (fs.existsSync(POSTED_HASHES_FILE))
      return new Set(JSON.parse(fs.readFileSync(POSTED_HASHES_FILE, 'utf-8')))
  } catch {}
  return new Set()
}

function savePostedHash(hash: string): void {
  const hashes = loadPostedHashes()
  hashes.add(hash)
  fs.writeFileSync(POSTED_HASHES_FILE, JSON.stringify(Array.from(hashes).slice(-2000)), 'utf-8')
}

async function articleIsLive(slug: string): Promise<boolean> {
  const url = `${config.site.domain}/news/${slug}`
  try {
    const res = await fetch(url, { method: 'HEAD' })
    if (res.ok) return true
    console.log(`[manual] Article not live (${res.status}): ${url}`)
    return false
  } catch {
    console.log(`[manual] Could not reach: ${url}`)
    return false
  }
}

async function generatePost(client: Anthropic, articleUrl: string): Promise<string> {
  const prompt = `Write a LinkedIn post for HumanoidIntelAI about this humanoid robotics story.

Story title: ${STORY.title}
Story summary: ${STORY.summary}
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

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })
  if (response.content[0].type !== 'text') throw new Error('No text response')
  return response.content[0].text.trim()
}

async function publishToLinkedIn(text: string): Promise<string> {
  const token     = config.api.linkedInToken
  const authorUrn = config.api.linkedInAuthorUrn

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

  if (!res.ok) throw new Error(`LinkedIn API ${res.status}: ${await res.text()}`)
  return res.headers.get('x-restli-id') ?? 'unknown'
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n[manual] LinkedIn first post script')
  console.log(`[manual] Story: "${STORY.title}"`)

  // Check credentials
  if (!config.api.linkedInToken || !config.api.linkedInAuthorUrn) {
    console.error('[manual] Missing LINKEDIN_ACCESS_TOKEN or LINKEDIN_AUTHOR_URN in .env.local')
    process.exit(1)
  }

  // Dedup check
  if (loadPostedHashes().has(STORY.hash)) {
    console.log('[manual] Already posted — remove hash from .linkedin-posted-hashes.json to repost')
    process.exit(0)
  }

  // Verify article is live
  const live = await articleIsLive(STORY.slug)
  if (!live) {
    console.error('[manual] Article is not live at humanoidintel.ai yet — deploy first, then re-run')
    process.exit(1)
  }

  const articleUrl = `${config.site.domain}/news/${STORY.slug}`
  console.log(`[manual] Article confirmed live: ${articleUrl}`)

  // Generate post
  console.log('[manual] Generating post with Claude Sonnet...')
  const anthropic = new Anthropic({ apiKey: config.api.anthropic })
  const post = await generatePost(anthropic, articleUrl)

  console.log('\n──── Generated post ────────────────────────────────────')
  console.log(post)
  console.log(`\n[manual] Character count: ${post.length}`)
  console.log('────────────────────────────────────────────────────────\n')

  // Post to LinkedIn
  console.log('[manual] Posting to LinkedIn...')
  const postUrn = await publishToLinkedIn(post)
  const postId  = postUrn.split(':').pop()

  console.log(`\n✓ Posted! https://www.linkedin.com/feed/update/${postUrn}`)
  savePostedHash(STORY.hash)
  console.log('[manual] Hash saved — won\'t be double-posted by the agent.\n')
}

main().catch((err) => {
  console.error('[manual] Error:', err?.message ?? err)
  process.exit(1)
})
