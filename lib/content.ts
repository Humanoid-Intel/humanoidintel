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
): Promise<{ article: Article; content: string } | null> {
  const filePath = path.join(contentRoot, 'news', `${slug}.md`)

  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content: markdown } = matter(raw)
    const content = await markdownToHtml(markdown)

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

    return { article, content }
  } catch {
    return null
  }
}

export function getFeaturedArticle(): Article | null {
  const articles = getArticles()
  if (articles.length === 0) return null
  // Prefer an explicitly featured article published within the last 7 days
  const recentFeatured = articles.find((a) => {
    if (!a.featured) return false
    const ageMs = Date.now() - new Date(a.date).getTime()
    return ageMs < 7 * 24 * 60 * 60 * 1000
  })
  // Fall back to the most recently published article
  return recentFeatured ?? articles[0]
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
