/**
 * Funding Extractor
 *
 * Detects funding announcements in scored stories and appends structured
 * entries to content/data/funding-rounds.json automatically.
 *
 * Triggered on stories that:
 *   - Contain funding keywords in title/summary
 *   - Match at least one tracked company
 *
 * Uses Claude to extract structured data, then deduplicates against
 * existing entries before writing.
 */

import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config'
import type { ScoredStory } from './dedup'

const FUNDING_ROUNDS_FILE   = path.join(__dirname, '../../content/data/funding-rounds.json')
const COMPANY_DIR_FILE      = path.join(__dirname, '../../content/data/company-directory.json')

// Keywords that strongly signal a funding announcement
const FUNDING_SIGNALS = [
  /\brais(?:ed|es|ing)\b/i,
  /\bseries\s+[a-e]\b/i,
  /\bseed\s+round\b/i,
  /\bfunding\s+round\b/i,
  /\bventure\s+capital\b/i,
  /\binvestment\s+round\b/i,
  /\bvalued\s+at\b/i,
  /\bvaluation\b/i,
  /\bled\s+by\b/i,          // "led by SoftBank"
  /\$\d+(?:\.\d+)?[BMK]\b/i, // "$250M", "$1.5B"
]

function isFundingStory(story: ScoredStory): boolean {
  const text = `${story.title} ${story.summary}`
  const matchCount = FUNDING_SIGNALS.filter(re => re.test(text)).length
  // Need at least 2 signals to be confident it's a funding story
  return matchCount >= 2
}

interface FundingRound {
  id: string
  company: string
  companySlug: string
  round: string
  amount: string
  valuation?: string
  leadInvestors: string[]
  date: string
  geography: string
  notes?: string
}

function loadExistingRounds(): FundingRound[] {
  try {
    return JSON.parse(fs.readFileSync(FUNDING_ROUNDS_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function isDuplicate(newRound: Partial<FundingRound>, existing: FundingRound[]): boolean {
  return existing.some(r => {
    const sameCompany = r.company.toLowerCase() === newRound.company?.toLowerCase()
    const sameRound = r.round.toLowerCase() === newRound.round?.toLowerCase()
    // Same year is close enough to catch re-reporting of the same round
    const sameYear = r.date?.slice(0, 4) === newRound.date?.slice(0, 4)
    return sameCompany && sameRound && sameYear
  })
}

function nextId(existing: FundingRound[]): string {
  const maxNum = existing.reduce((max, r) => {
    const num = parseInt(r.id.replace('fr-', ''), 10)
    return isNaN(num) ? max : Math.max(max, num)
  }, 0)
  return `fr-${String(maxNum + 1).padStart(3, '0')}`
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const EXTRACT_SYSTEM = `You are a financial data extraction assistant for humanoidintel.ai.
Extract structured funding round data from robotics news stories.
Respond ONLY with valid JSON — no markdown fences, no explanation.

If you cannot confidently extract a field, use null for optional fields or an empty string for required ones.
Always return a single JSON object matching this exact shape:
{
  "company": "string — official company name",
  "round": "string — e.g. 'Series A', 'Series B', 'Seed', 'Pre-Seed', 'Strategic', 'IPO', 'Debt'",
  "amount": "string — e.g. '$250M' or '€100M' or 'RMB2.5B', use the currency symbol present in the source",
  "valuation": "string or null — post-money valuation if mentioned, e.g. '$1.8B'",
  "leadInvestors": ["array of investor names, lead first — empty array if not mentioned"],
  "date": "string — ISO date YYYY-MM-DD, use the story publish date if announcement date not stated",
  "geography": "string — country of company HQ, e.g. 'USA', 'UK', 'Germany', 'China', 'South Korea'",
  "notes": "string — 1-2 sentences of context: what the capital is for, strategic significance"
}`

async function extractFundingFromStory(
  story: ScoredStory,
  client: Anthropic,
): Promise<Partial<FundingRound> | null> {
  const userMsg = `Story title: ${story.title}
Story date: ${story.publishedAt.toISOString().slice(0, 10)}
Story summary: ${story.summary}
Source URL: ${story.url}

Extract the funding round data from this story.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      system: EXTRACT_SYSTEM,
      messages: [{ role: 'user', content: userMsg }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    const parsed = JSON.parse(text) as Partial<FundingRound>

    // Reject if no company or amount
    if (!parsed.company || !parsed.amount) return null
    // Reject if amount looks like garbage (no digit)
    if (!/\d/.test(parsed.amount)) return null

    return parsed
  } catch (err) {
    console.error(`[FundingExtractor] Parse error for "${story.title}":`, err)
    return null
  }
}

// After new rounds are saved, sync company-directory.json with latest valuation
function syncCompanyData(newRounds: FundingRound[]): void {
  if (newRounds.length === 0) return
  if (!fs.existsSync(COMPANY_DIR_FILE)) return

  try {
    const companies = JSON.parse(fs.readFileSync(COMPANY_DIR_FILE, 'utf-8')) as Array<Record<string, unknown>>
    let changed = false

    for (const round of newRounds) {
      const company = companies.find((c) => c.slug === round.companySlug)
      if (!company) continue

      if (round.valuation) {
        company.latestValuation = round.valuation
        changed = true
        console.log(`[FundingExtractor] Updated ${company.name} latestValuation → ${round.valuation}`)
      }
    }

    if (changed) {
      fs.writeFileSync(COMPANY_DIR_FILE, JSON.stringify(companies, null, 2), 'utf-8')
      console.log('[FundingExtractor] ✓ Synced company-directory.json with new valuations')
    }
  } catch (err) {
    console.error('[FundingExtractor] Failed to sync company-directory.json:', err)
  }
}

export async function extractAndSaveFundingRounds(stories: ScoredStory[]): Promise<number> {
  if (!config.api.anthropic) return 0

  const fundingStories = stories.filter(isFundingStory)
  if (fundingStories.length === 0) {
    console.log('[FundingExtractor] No funding stories detected.')
    return 0
  }

  console.log(`[FundingExtractor] Detected ${fundingStories.length} potential funding stories`)

  const client = new Anthropic({ apiKey: config.api.anthropic })
  const existing = loadExistingRounds()
  const newRounds: FundingRound[] = []

  for (const story of fundingStories) {
    console.log(`[FundingExtractor] Extracting: "${story.title.slice(0, 70)}"`)

    const extracted = await extractFundingFromStory(story, client)
    if (!extracted) {
      console.log(`[FundingExtractor] ↳ Could not extract structured data, skipping`)
      continue
    }

    if (isDuplicate(extracted, [...existing, ...newRounds])) {
      console.log(`[FundingExtractor] ↳ Duplicate detected (${extracted.company} ${extracted.round}), skipping`)
      continue
    }

    const round: FundingRound = {
      id: nextId([...existing, ...newRounds]),
      company: extracted.company!,
      companySlug: slugify(extracted.company!),
      round: extracted.round || 'Unknown',
      amount: extracted.amount!,
      valuation: extracted.valuation ?? undefined,
      leadInvestors: extracted.leadInvestors ?? [],
      date: extracted.date || story.publishedAt.toISOString().slice(0, 10),
      geography: extracted.geography || 'Unknown',
      notes: extracted.notes,
    }

    console.log(`[FundingExtractor] ↳ New entry: ${round.company} ${round.round} ${round.amount} (${round.date})`)
    newRounds.push(round)
  }

  if (newRounds.length === 0) {
    console.log('[FundingExtractor] No new funding rounds to add.')
    return 0
  }

  // Append and write atomically
  const updated = [...existing, ...newRounds]
  fs.writeFileSync(FUNDING_ROUNDS_FILE, JSON.stringify(updated, null, 2), 'utf-8')
  console.log(`[FundingExtractor] ✓ Added ${newRounds.length} new funding round(s) to funding-rounds.json`)

  // Sync company valuations
  syncCompanyData(newRounds)

  return newRounds.length
}
