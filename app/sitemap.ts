import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

// These imports work at build time since content is read from filesystem
async function getArticleSlugs(): Promise<string[]> {
  try {
    const { getArticles } = await import('@/lib/content')
    const articles = await getArticles()
    return articles.map((a) => a.slug)
  } catch {
    return []
  }
}

async function getRobotSlugs(): Promise<string[]> {
  try {
    const { getRobots } = await import('@/lib/content')
    const robots = await getRobots()
    return robots.map((r) => r.slug)
  } catch {
    return []
  }
}

async function getCompanySlugs(): Promise<string[]> {
  try {
    const { getCompanies } = await import('@/lib/content')
    const companies = await getCompanies()
    return companies.map((c) => c.slug)
  } catch {
    return []
  }
}

async function getGlossarySlugs(): Promise<string[]> {
  try {
    const { getGlossaryTerms } = await import('@/lib/content')
    const terms = await getGlossaryTerms()
    return terms.map((t) => t.slug)
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://humanoidintel.ai'
  const now = new Date()

  const [articleSlugs, robotSlugs, companySlugs, glossarySlugs] = await Promise.all([
    getArticleSlugs(),
    getRobotSlugs(),
    getCompanySlugs(),
    getGlossarySlugs(),
  ])

  // Jobs (list page only — individual jobs don't have dedicated pages)


  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/news`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/robots`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/companies`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/funding`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/research`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/glossary`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/newsletter`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/jobs`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/compare`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/events`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/watchlist`, lastModified: now, changeFrequency: 'daily', priority: 0.5 },
    { url: `${baseUrl}/map`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/supply-chain`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${baseUrl}/news/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const robotRoutes: MetadataRoute.Sitemap = robotSlugs.map((slug) => ({
    url: `${baseUrl}/robots/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const companyRoutes: MetadataRoute.Sitemap = companySlugs.map((slug) => ({
    url: `${baseUrl}/companies/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const glossaryRoutes: MetadataRoute.Sitemap = glossarySlugs.map((slug) => ({
    url: `${baseUrl}/glossary/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...articleRoutes, ...robotRoutes, ...companyRoutes, ...glossaryRoutes]
}
