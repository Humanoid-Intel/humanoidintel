/**
 * Generates /public/search-index.json at build time and after article publishes.
 * Run via: npx tsx scripts/generate-search-index.ts
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentRoot = path.join(__dirname, '../content')
const outputPath = path.join(__dirname, '../public/search-index.json')

interface SearchEntry {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  tags: string[]
  companies: string[]
}

function buildIndex(): SearchEntry[] {
  const newsDir = path.join(contentRoot, 'news')
  if (!fs.existsSync(newsDir)) return []

  const files = fs.readdirSync(newsDir).filter((f) => f.endsWith('.md'))

  return files.map((filename) => {
    const slug = filename.replace(/\.md$/, '')
    const raw = fs.readFileSync(path.join(newsDir, filename), 'utf-8')
    const { data } = matter(raw)

    return {
      slug,
      title: data.title ?? '',
      excerpt: data.excerpt ?? '',
      category: data.category ?? '',
      date: data.date ?? '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      companies: Array.isArray(data.companies) ? data.companies : [],
    }
  })
}

const index = buildIndex()
const publicDir = path.dirname(outputPath)
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(index, null, 2), 'utf-8')
console.log(`[search-index] Wrote ${index.length} entries to public/search-index.json`)
