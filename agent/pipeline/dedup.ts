/**
 * Deduplication & Scoring Engine
 * Filters duplicate stories and scores newsworthiness
 */

import fs from 'fs'
import path from 'path'
import { config } from '../config'
import type { RawStory } from '../sources/rss'

const SEEN_HASHES_FILE = path.join(__dirname, '../.seen-hashes.json')
const HASH_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function loadSeenHashes(): Map<string, number> {
  try {
    if (fs.existsSync(SEEN_HASHES_FILE)) {
      const data = JSON.parse(fs.readFileSync(SEEN_HASHES_FILE, 'utf-8'))
      const now = Date.now()
      // Support both old format (array of strings) and new format (array of [hash, ts] pairs)
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
        // Migrate from old plain-array format — assign current timestamp so they expire in 7 days
        return new Map(data.map((h: string) => [h, now]))
      }
      // New format: [[hash, timestamp], ...]
      const map = new Map<string, number>(data)
      // Prune expired entries on load
      for (const [hash, ts] of map) {
        if (now - ts > HASH_TTL_MS) map.delete(hash)
      }
      return map
    }
  } catch {}
  return new Map()
}

function saveSeenHashes(hashes: Map<string, number>): void {
  // Keep only last 5000 hashes to prevent unbounded growth
  const entries = Array.from(hashes.entries()).slice(-5000)
  fs.writeFileSync(SEEN_HASHES_FILE, JSON.stringify(entries), 'utf-8')
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

const ROBOTICS_REQUIRED = /humanoid|bipedal|robot|robotics|figure ai|optimus|digit|atlas|phoenix|apollo|neo beta|unitree|boston dynamics|agility|apptronik|sanctuary|1x technologies|neura|fourier|agibot|kepler|physical intelligence|clone robotics|skild|galbot|leju|ubtech|astribot|sunday robot|wandercraft|enchanted tools|mentee|flexion|dyna robotics|persona ai|actuator|locomotion|manipulation|exoskeleton|legged|quadruped|end.effector|sim.to.real|whole.body|combat robot|robot soldier|phantom mk|robot marathon|android robot|dexterous robot/i

// If ANY of these appear WITHOUT humanoid context → hard reject
const NON_HUMANOID_ONLY = /\bquadruped\b|\buav\b|\bdrone[s]?\b|aerial robot|underwater robot|snake robot|fish robot|continuum robot|soft robot|cable.driven|guide dog robot|swarm robot|multi.uav|robot dog|dog robot|floor cleaning robot|pool cleaning|lawn mowing robot|delivery drone|path planning.*uav|uav.*navigation|multi.agent path finding|mapf|autonomous vehicle|self.driving|lidar slam|occupancy grid|\bcobot[s]?\b|robotic arm[s]?|robot arm[s]?|surgical robot|medical robot|industrial robot[s]?|welding robot|palletizing robot|pick.and.place robot|\bamr[s]?\b|autonomous mobile robot|\bagv[s]?\b|automated guided vehicle|warehouse robot[s]?|logistics robot[s]?|anymal|\bspot robot\b/i

// ALL stories must contain at least one of these humanoid-specific signals
const HUMANOID_SPECIFIC = /humanoid|bipedal|figure ai|optimus|digit\b|atlas\b|phoenix|apollo\b|neo beta|unitree|boston dynamics|agility robotics|apptronik|sanctuary ai|1x technologies|neura robotics|fourier intelligence|agibot|kepler robot|physical intelligence|clone robotics|skild|galbot|leju|ubtech|astribot|sunday robot|wandercraft|enchanted tools|mentee robotics|mobileye.*robot|flexion.*robot|dyna robotics|persona ai|gr00t|isaac gr00t|jetson thor|android robot|loco.manipul|whole.body loco|dexterous hand|dexterous manipulation|bimanual|teleoperat|humanoid locomotion|humanoid manipulation|bipedal locomotion|humanoid control|walking robot|standing robot|balance control.*robot|robot.*balance|\bexoskeleton[s]?\b|human.like robot|bipedal walking|walking biped|robot foundation model|vision.language.action|\bvla\b|generalist robot|\bpi zero\b|π0|lerobot|physical ai/i

function isRoboticsRelevant(story: RawStory): boolean {
  const text = `${story.title} ${story.summary}`

  // Hard reject: known non-humanoid topics (unless paired with humanoid context)
  if (NON_HUMANOID_ONLY.test(text) && !HUMANOID_SPECIFIC.test(text)) return false

  // Must mention robotics at all
  if (!ROBOTICS_REQUIRED.test(text)) return false

  // Require a humanoid-specific signal for ALL stories (not just research papers)
  // This prevents general robotics (industrial arms, cobots, AMRs) from slipping through
  if (!HUMANOID_SPECIFIC.test(text)) return false

  return true
}

function scoreStory(story: RawStory): number {
  const text = `${story.title} ${story.summary}`.toLowerCase()
  let score = 0

  // Hard gate — must be robotics-related
  if (!isRoboticsRelevant(story)) return 0

  // Hard age gate — only process stories from the last 14 days
  const ageMs = Date.now() - story.publishedAt.getTime()
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  if (ageDays > 14) return 0

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
  } else {
    score += 40 // base score for any robotics news
  }

  // Humanoid-specific boost
  if (/humanoid|bipedal|figure ai|optimus|digit|atlas|phoenix|apollo|neo beta/.test(text)) {
    score += 25
  }

  // Tracked company boost
  const companies = Object.values(config.trackedCompanies)
  if (companies.some((c) => text.includes(c.toLowerCase()))) {
    score += 15
  }

  // Freshness bonus — heavily reward today's and this week's stories
  const ageHours = ageMs / (1000 * 60 * 60)
  if (ageHours < 6) score += 30       // last 6 hours: big boost
  else if (ageHours < 24) score += 20  // today: strong boost
  else if (ageHours < 48) score += 10  // yesterday: moderate boost
  else if (ageDays < 7) score += 5     // this week: small boost

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
  const now = Date.now()

  for (const story of stories) {
    // Hash-based dedup (with TTL — only block if seen within last 7 days)
    if (seenHashes.has(story.hash)) continue

    // Title similarity dedup (85% threshold)
    const isDuplicate = processedTitles.some(
      (existing) => titleSimilarity(existing, story.title) > 0.85,
    )
    if (isDuplicate) continue

    const score = scoreStory(story)
    if (score < config.scoring.minThreshold) continue

    processedTitles.push(story.title)
    seenHashes.set(story.hash, now)

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
