import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import type {
  Article,
  Robot,
  Company,
  FundingRound,
  GlossaryTerm,
  NewsletterEdition,
  Job,
} from './types'

const contentRoot = path.join(process.cwd(), 'content')

// ---------------------------------------------------------------------------
// Markdown → HTML helper
// ---------------------------------------------------------------------------
async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(remarkHtml, { sanitize: false }).process(markdown)
  return result.toString()
}

// ---------------------------------------------------------------------------
// FAQ extraction from markdown
// ---------------------------------------------------------------------------

export function extractFAQs(markdown: string): { q: string; a: string }[] {
  const sectionMatch = markdown.match(
    /##\s*Frequently Asked Questions\s*\n([\s\S]*?)(?=\n## |\s*$)/i,
  )
  if (!sectionMatch) return []

  const section = sectionMatch[1]
  const faqs: { q: string; a: string }[] = []
  const pattern = /\*\*(.+?)\*\*\s*\n+([\s\S]*?)(?=\n\n?\*\*|\s*$)/g
  let match
  while ((match = pattern.exec(section)) !== null) {
    const q = match[1].trim()
    const a = match[2].trim().replace(/\n+/g, ' ')
    if (q && a) faqs.push({ q, a })
  }
  return faqs
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export function getArticles(): Article[] {
  const newsDir = path.join(contentRoot, 'news')

  if (!fs.existsSync(newsDir)) return []

  try {
    const files = fs
      .readdirSync(newsDir)
      .filter((f) => f.endsWith('.md'))

    const articles: Article[] = files.map((filename) => {
      const slug = filename.replace(/\.md$/, '')
      const filePath = path.join(newsDir, filename)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(raw)

      return {
        slug,
        title: data.title ?? '',
        date: data.date ?? '',
        updated: data.updated,
        category: data.category ?? 'market',
        tags: data.tags ?? [],
        companies: data.companies,
        robots: data.robots,
        excerpt: data.excerpt ?? '',
        featured: data.featured ?? false,
        sources: data.sources,
      } as Article
    })

    return articles.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  } catch {
    return []
  }
}

export async function getArticle(
  slug: string,
): Promise<{ article: Article; content: string; faqs: { q: string; a: string }[] } | null> {
  const filePath = path.join(contentRoot, 'news', `${slug}.md`)

  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content: markdown } = matter(raw)
    const content = await markdownToHtml(markdown)
    const faqs = extractFAQs(markdown)

    const article: Article = {
      slug,
      title: data.title ?? '',
      date: data.date ?? '',
      updated: data.updated,
      category: data.category ?? 'market',
      tags: data.tags ?? [],
      companies: data.companies,
      robots: data.robots,
      excerpt: data.excerpt ?? '',
      featured: data.featured ?? false,
      sources: data.sources,
    }

    return { article, content, faqs }
  } catch {
    return null
  }
}

/**
 * Smart headline ranker — picks the most engaging article for the hero slot.
 * Scoring factors (highest score wins):
 *   +40  funding/acquisition (big money stories)
 *   +35  major company involved (Tesla, NVIDIA, Boston Dynamics, Figure, etc.)
 *   +25  breaking category
 *   +20  market category
 *   +15  deep-dive category
 *   +15  title contains dollar amounts or large numbers
 *   +10  explicitly marked featured
 *   -3   per hour of age (newer wins, but a great story beats a fresh mediocre one)
 *   -100 older than 48 hours (hard cutoff — never headline stale content)
 */
export function getFeaturedArticle(): Article | null {
  const articles = getArticles()
  if (articles.length === 0) return null

  const MAJOR_COMPANIES = [
    'tesla', 'nvidia', 'boston dynamics', 'figure', 'apptronik', '1x',
    'sanctuary', 'agility', 'unitree', 'ubtech', 'xiaomi', 'amazon',
    'google', 'deepmind', 'openai', 'physical intelligence', 'skild',
    'neura', 'fourier', 'samsung', 'hyundai', 'toyota', 'bmw', 'mercedes',
    'apple', 'meta', 'microsoft', 'renault',
  ]

  const FUNDING_KEYWORDS = [
    'raises', 'funding', 'series a', 'series b', 'series c', 'series d',
    'ipo', 'acquisition', 'acquires', 'valuation', 'investment',
    'billion', 'million', 'unicorn', 'spac', 'merger',
  ]

  const now = Date.now()
  const MAX_AGE_MS = 48 * 60 * 60 * 1000 // 48 hours

  let bestArticle: Article | null = null
  let bestScore = -Infinity

  for (const article of articles) {
    const ageMs = now - new Date(article.date).getTime()
    if (ageMs > MAX_AGE_MS) continue // hard cutoff

    let score = 0
    const titleLower = article.title.toLowerCase()
    const excerptLower = (article.excerpt || '').toLowerCase()
    const combined = `${titleLower} ${excerptLower}`
    const tagsLower = (article.tags || []).map(t => t.toLowerCase())
    const companiesLower = (article.companies || []).map(c => c.toLowerCase())

    // Funding/acquisition signals
    const hasFundingKeyword = FUNDING_KEYWORDS.some(kw => combined.includes(kw))
    const hasDollarAmount = /\$\d/.test(combined)
    if (hasFundingKeyword || hasDollarAmount) score += 40

    // Major company involvement
    const hasMajor = MAJOR_COMPANIES.some(c =>
      companiesLower.some(ac => ac.includes(c)) || combined.includes(c)
    )
    if (hasMajor) score += 35

    // Category bonuses
    if (article.category === 'breaking') score += 25
    if (article.category === 'market') score += 20
    if (article.category === 'deep-dive') score += 15

    // Dollar amounts or big numbers in title (eye-catching)
    if (/\$[\d.]+[bmk]|\d{3,}m|\d+\s*billion|\d+\s*million/i.test(article.title)) score += 15

    // Explicitly marked featured by the writer
    if (article.featured) score += 10

    // Partnership/deployment signals
    if (/deploy|partner|launch|first|record|breakthrough/i.test(titleLower)) score += 10

    // Recency decay: -3 points per hour old
    const ageHours = ageMs / (60 * 60 * 1000)
    score -= ageHours * 3

    if (score > bestScore) {
      bestScore = score
      bestArticle = article
    }
  }

  // If nothing scored within 48h, fall back to most recent article
  return bestArticle ?? articles[0]
}

// ---------------------------------------------------------------------------
// Robots
// ---------------------------------------------------------------------------

export function getRobots(): Robot[] {
  const filePath = path.join(contentRoot, 'data', 'robot-specs.json')

  if (!fs.existsSync(filePath)) return []

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as Robot[]
  } catch {
    return []
  }
}

export function getRobot(slug: string): Robot | null {
  const robots = getRobots()
  return robots.find((r) => r.slug === slug) ?? null
}

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

export function getCompanies(): Company[] {
  const filePath = path.join(contentRoot, 'data', 'company-directory.json')

  if (!fs.existsSync(filePath)) return []

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as Company[]
  } catch {
    return []
  }
}

export function getCompany(slug: string): Company | null {
  const companies = getCompanies()
  return companies.find((c) => c.slug === slug) ?? null
}

// ---------------------------------------------------------------------------
// Funding Rounds
// ---------------------------------------------------------------------------

export function getFundingRounds(): FundingRound[] {
  const filePath = path.join(contentRoot, 'data', 'funding-rounds.json')

  if (!fs.existsSync(filePath)) return []

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as FundingRound[]
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------

export function getGlossaryTerms(): GlossaryTerm[] {
  const glossaryDir = path.join(contentRoot, 'glossary')

  if (!fs.existsSync(glossaryDir)) return []

  try {
    const files = fs
      .readdirSync(glossaryDir)
      .filter((f) => f.endsWith('.md'))

    const terms: GlossaryTerm[] = files.map((filename) => {
      const slug = filename.replace(/\.md$/, '')
      const filePath = path.join(glossaryDir, filename)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(raw)

      return {
        slug,
        term: data.term ?? '',
        definition: data.definition ?? content.trim().split('\n')[0] ?? '',
        category: data.category ?? '',
        relatedTerms: data.relatedTerms,
        seeAlso: data.seeAlso,
      } as GlossaryTerm
    })

    return terms.sort((a, b) => a.term.localeCompare(b.term))
  } catch {
    return []
  }
}

export async function getGlossaryTerm(
  slug: string,
): Promise<{ term: GlossaryTerm; content: string } | null> {
  const filePath = path.join(contentRoot, 'glossary', `${slug}.md`)

  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content: markdown } = matter(raw)
    const content = await markdownToHtml(markdown)

    const term: GlossaryTerm = {
      slug,
      term: data.term ?? '',
      definition: data.definition ?? '',
      category: data.category ?? '',
      relatedTerms: data.relatedTerms,
      seeAlso: data.seeAlso,
    }

    return { term, content }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Newsletter Editions
// ---------------------------------------------------------------------------

export function getNewsletterEditions(): NewsletterEdition[] {
  const newsletterDir = path.join(contentRoot, 'newsletter')

  if (!fs.existsSync(newsletterDir)) return []

  try {
    const files = fs.readdirSync(newsletterDir).filter((f) => f.endsWith('.md'))

    const editions: NewsletterEdition[] = files.map((filename) => {
      const slug = filename.replace(/\.md$/, '')
      const filePath = path.join(newsletterDir, filename)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(raw)

      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? '',
        excerpt: data.excerpt ?? '',
        edition: data.edition ?? 0,
      } as NewsletterEdition
    })

    return editions.sort((a, b) => b.edition - a.edition)
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export function getJobs(): Job[] {
  const filePath = path.join(contentRoot, 'data/jobs.json')
  if (!fs.existsSync(filePath)) return []
  try {
    const all = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Job[]
    return all
      .filter((j) => j.status === 'open')
      .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
  } catch {
    return []
  }
}

export async function getNewsletterEdition(
  slug: string,
): Promise<{ edition: NewsletterEdition; content: string } | null> {
  const filePath = path.join(contentRoot, 'newsletter', `${slug}.md`)

  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content: markdown } = matter(raw)
    const content = await markdownToHtml(markdown)

    const edition: NewsletterEdition = {
      slug,
      title: data.title ?? '',
      date: data.date ?? '',
      excerpt: data.excerpt ?? '',
      edition: data.edition ?? 0,
    }

    return { edition, content }
  } catch {
    return null
  }
}
