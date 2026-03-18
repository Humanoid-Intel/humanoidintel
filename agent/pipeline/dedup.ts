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
const CONTENT_DIR = path.join(__dirname, '../../content/news')

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

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'with', 'from', 'by',
  'its', 'is', 'are', 'was', 'were', 'has', 'have', 'that', 'this', 'will', 'be',
  'new', 'via', 'using', 'into', 'over', 'how', 'why', 'what', 'which',
])

function normalizeTitle(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
}

function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(normalizeTitle(a))
  const wordsB = new Set(normalizeTitle(b))
  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)))
  const union = new Set([...wordsA, ...wordsB])
  return union.size === 0 ? 0 : intersection.size / union.size
}

// Extract significant named entities (capitalized words / known company names)
// NOTE: Do NOT use `g` flag here — .test() with `g` flag has stateful lastIndex bugs
const KNOWN_ENTITIES = /nvidia|skild|figure|tesla|boston dynamics|agility|apptronik|unitree|sanctuary|1x|neura|fourier|agibot|galbot|astribot|microsoft|google|amazon|apple|meta|openai|anthropic|softbank|foxconn|abb|universal robots|kawasaki|honda|hyundai|samsung|lg|baidu|bytedance|huawei|xiaomi|uber|alphabet|xpeng|ubtech|kepler|sunday|clone robotics|foundation robotics|mind robotics/i
// Separate regex with `g` flag ONLY for matchAll (which handles `g` correctly)
const KNOWN_ENTITIES_G = new RegExp(KNOWN_ENTITIES.source, 'gi')

function extractEntityPair(title: string): string {
  const entities = [...title.matchAll(KNOWN_ENTITIES_G)].map(m => m[0].toLowerCase())
  const unique = [...new Set(entities)].sort()
  return unique.slice(0, 3).join('+') // top 3 entities as fingerprint
}

/**
 * Extract topic keywords — the "what happened" regardless of how it's worded.
 * Returns 2-3 key topic words (verbs/nouns minus company names).
 */
const TOPIC_WORDS = /deploy|demo|debut|launch|partner|fund|rais|hire|acquir|unveil|reveal|show|perform|produc|manufactur|ship|deliver|announc|expand|open|build|test|pilot|trial|patent|licens|invest|valuat|ipo|merge|certif|collabor|secur|land|sign|award|present|exhibit|display|showcase/gi

function extractTopicFingerprint(title: string): string {
  const topics = [...title.matchAll(TOPIC_WORDS)].map(m => m[0].toLowerCase().slice(0, 5))
  return [...new Set(topics)].sort().join('+')
}

/**
 * Categorize a title into a broad event type so we can distinguish
 * genuinely different stories about the same company on the same day.
 * e.g. "Agibot raises $100M" (funding) vs "Agibot deploys at BMW" (deployment) = different
 *      "Agibot demos live show" vs "Agibot debuts robot performance" = SAME
 */
function broadEventType(title: string): string {
  const t = title.toLowerCase()
  if (/fund|rais|series [a-e]|invest|valuat|\$\d|million|billion|ipo|spac/.test(t)) return 'funding'
  if (/hire|appoint|ceo|cto|resign|step.*down|join.*as/.test(t)) return 'people'
  if (/polic|regulat|ban|law|osha|compliance|govern/.test(t)) return 'policy'
  if (/patent|licens/.test(t)) return 'ip'
  return 'general' // demos, launches, partnerships, deployments all collapse to "general"
}

/**
 * Check if a story title is a near-duplicate of any existing title.
 * Four-layer detection:
 *   1. Jaccard word similarity > 0.28
 *   2. Same entity pair (2+ shared companies/entities)
 *   3. Same company + same topic verb (e.g. "Agibot" + "demo/show/perform")
 *   4. Same company + same broad event type = likely same story (nuclear dedup)
 */
export function isTitleDuplicate(
  story: { title: string },
  existingTitles: string[],
  threshold = 0.28,
): boolean {
  const storyEntityPair = extractEntityPair(story.title)
  const storyTopicFp = extractTopicFingerprint(story.title)
  const storyWords = normalizeTitle(story.title)
  const storyEventType = broadEventType(story.title)

  return existingTitles.some((existing) => {
    // Layer 1: Jaccard word similarity (lowered from 0.35 to 0.28)
    if (titleSimilarity(existing, story.title) > threshold) return true

    // Layer 2: Same 2+ entity pair = same story
    if (storyEntityPair.length > 0 && storyEntityPair.includes('+')) {
      const existingEntityPair = extractEntityPair(existing)
      if (existingEntityPair === storyEntityPair) return true
    }

    // Layer 3: Same single company + overlapping topic verb = same story
    if (storyEntityPair.length > 0 && !storyEntityPair.includes('+')) {
      const existingEntityPair = extractEntityPair(existing)
      if (existingEntityPair === storyEntityPair) {
        const existingTopicFp = extractTopicFingerprint(existing)
        // Same company + any shared topic verb = duplicate
        if (storyTopicFp && existingTopicFp) {
          const storyTopics = new Set(storyTopicFp.split('+'))
          const existingTopics = new Set(existingTopicFp.split('+'))
          const overlap = [...storyTopics].some(t => existingTopics.has(t))
          if (overlap) return true
        }
        // Same company + 2+ shared content words (beyond company name) = duplicate
        const existingWords = normalizeTitle(existing)
        const shared = storyWords.filter(w => existingWords.includes(w) && !KNOWN_ENTITIES.test(w))
        if (shared.length >= 2) return true

        // Layer 4: Same company + same broad event type = very likely duplicate
        // Only genuinely different event types (funding vs deployment vs people) survive
        const existingEventType = broadEventType(existing)
        if (storyEventType === existingEventType) {
          console.log(`[Dedup] Layer 4 catch: same company "${storyEntityPair}" + same event type "${storyEventType}" → "${story.title.slice(0, 60)}" ≈ "${existing.slice(0, 60)}"`)
          return true
        }
      }
    }

    return false
  })
}

/** Load titles of all already-published articles so we can skip near-duplicates across runs.
 *  Cached so it's only loaded once per process. */
let _publishedTitlesCache: string[] | null = null

function loadPublishedTitles(): string[] {
  if (_publishedTitlesCache !== null) return _publishedTitlesCache
  try {
    if (!fs.existsSync(CONTENT_DIR)) {
      _publishedTitlesCache = []
      return _publishedTitlesCache
    }
    _publishedTitlesCache = fs
      .readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const content = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf-8')
        const match = content.match(/^title:\s*["']?(.+?)["']?\s*$/m)
        return match ? match[1].trim() : ''
      })
      .filter(Boolean)
    return _publishedTitlesCache
  } catch {
    _publishedTitlesCache = []
    return _publishedTitlesCache
  }
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
  // Seed with titles of already-published articles to catch cross-run duplicates
  const processedTitles: string[] = loadPublishedTitles()
  const results: ScoredStory[] = []
  const now = Date.now()

  for (const story of stories) {
    // Hash-based dedup (with TTL — only block if seen within last 7 days)
    if (seenHashes.has(story.hash)) continue

    // Title similarity dedup — 55% threshold catches "same story, different headline"
    // Cross-run: compares against all published article titles loaded above
    // Within-run: compares against stories already selected this run
    if (isTitleDuplicate(story, processedTitles)) {
      console.log(`[Dedup] Skipped near-duplicate title: "${story.title}"`)
      continue
    }

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
