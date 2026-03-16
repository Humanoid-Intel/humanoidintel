/**
 * Generates /public/search-index.json at build time.
 * Indexes: news articles, companies, robots (RobotDB), funding rounds, glossary terms.
 * Run via: npx tsx scripts/generate-search-index.ts
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const root = path.join(__dirname, '..')
const outputPath = path.join(root, 'public/search-index.json')

type ContentType = 'news' | 'company' | 'robot' | 'funding' | 'glossary'

interface SearchEntry {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  tags: string[]
  companies: string[]
  type: ContentType
  url: string
}

// ── 1. News articles ──────────────────────────────────────────────────────────
function indexNews(): SearchEntry[] {
  const newsDir = path.join(root, 'content/news')
  if (!fs.existsSync(newsDir)) return []
  return fs.readdirSync(newsDir)
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '')
      const { data } = matter(fs.readFileSync(path.join(newsDir, filename), 'utf-8'))
      return {
        slug,
        title: data.title ?? '',
        excerpt: data.excerpt ?? '',
        category: data.category ?? 'news',
        date: data.date ?? '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        companies: Array.isArray(data.companies) ? data.companies : [],
        type: 'news' as ContentType,
        url: `/news/${slug}`,
      }
    })
}

// ── 2. Companies ──────────────────────────────────────────────────────────────
function indexCompanies(): SearchEntry[] {
  const file = path.join(root, 'content/data/company-directory.json')
  if (!fs.existsSync(file)) return []
  const companies: any[] = JSON.parse(fs.readFileSync(file, 'utf-8'))
  return companies.map((c) => ({
    slug: c.slug,
    title: c.name,
    excerpt: c.description ? c.description.slice(0, 180) + '…' : '',
    category: 'company',
    date: '',
    tags: [c.hq, c.status].filter(Boolean),
    companies: [c.name],
    type: 'company' as ContentType,
    url: `/companies/${c.slug}`,
  }))
}

// ── 3. RobotDB ────────────────────────────────────────────────────────────────
function indexRobots(): SearchEntry[] {
  const file = path.join(root, 'content/data/robot-specs.json')
  if (!fs.existsSync(file)) return []
  const robots: any[] = JSON.parse(fs.readFileSync(file, 'utf-8'))
  return robots.map((r) => ({
    slug: r.slug,
    title: `${r.name} — ${r.manufacturer}`,
    excerpt: r.description ? r.description.slice(0, 180) + '…' : '',
    category: 'robot',
    date: '',
    tags: [r.status, r.actuatorType, r.country].filter(Boolean),
    companies: [r.manufacturer],
    type: 'robot' as ContentType,
    url: `/robots/${r.slug}`,
  }))
}

// ── 4. Funding rounds ─────────────────────────────────────────────────────────
function indexFunding(): SearchEntry[] {
  const file = path.join(root, 'content/data/funding-rounds.json')
  if (!fs.existsSync(file)) return []
  const rounds: any[] = JSON.parse(fs.readFileSync(file, 'utf-8'))
  return rounds.map((r) => ({
    slug: r.id,
    title: `${r.company} — ${r.round} ${r.amount}`,
    excerpt: r.notes ?? `${r.round} of ${r.amount} led by ${(r.leadInvestors ?? []).join(', ')}.`,
    category: 'funding',
    date: r.date ?? '',
    tags: [r.geography, r.round].filter(Boolean),
    companies: [r.company],
    type: 'funding' as ContentType,
    url: `/funding`,
  }))
}

// ── 5. Glossary ───────────────────────────────────────────────────────────────
function indexGlossary(): SearchEntry[] {
  const glossaryDir = path.join(root, 'content/glossary')
  if (!fs.existsSync(glossaryDir)) return []
  return fs.readdirSync(glossaryDir)
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '')
      const { data, content } = matter(fs.readFileSync(path.join(glossaryDir, filename), 'utf-8'))
      const excerpt = (data.definition ?? content.slice(0, 180)).replace(/\n/g, ' ').trim()
      return {
        slug,
        title: data.term ?? slug,
        excerpt: excerpt.length > 180 ? excerpt.slice(0, 177) + '…' : excerpt,
        category: 'glossary',
        date: '',
        tags: [data.category, ...(data.relatedTerms ?? [])].filter(Boolean),
        companies: [],
        type: 'glossary' as ContentType,
        url: `/glossary/${slug}`,
      }
    })
}

// ── Build & write ─────────────────────────────────────────────────────────────
const index: SearchEntry[] = [
  ...indexNews(),
  ...indexCompanies(),
  ...indexRobots(),
  ...indexFunding(),
  ...indexGlossary(),
]

// Sort news first (by date desc), then others alphabetically
index.sort((a, b) => {
  if (a.type === 'news' && b.type === 'news') {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  }
  if (a.type === 'news') return -1
  if (b.type === 'news') return 1
  return a.title.localeCompare(b.title)
})

const publicDir = path.dirname(outputPath)
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(index, null, 2), 'utf-8')

const counts = {
  news: index.filter((e) => e.type === 'news').length,
  companies: index.filter((e) => e.type === 'company').length,
  robots: index.filter((e) => e.type === 'robot').length,
  funding: index.filter((e) => e.type === 'funding').length,
  glossary: index.filter((e) => e.type === 'glossary').length,
}
console.log(`[search-index] ${index.length} entries → news:${counts.news} companies:${counts.companies} robots:${counts.robots} funding:${counts.funding} glossary:${counts.glossary}`)
