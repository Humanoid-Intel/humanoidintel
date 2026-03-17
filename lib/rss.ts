import { NextResponse } from 'next/server'
import { getArticles } from '@/lib/content'
import type { Article } from '@/lib/types'

const BASE_URL = 'https://humanoidintel.ai'

interface RssFeedOptions {
  title: string
  description: string
  feedPath: string
  filter?: (article: Article) => boolean
  limit?: number
}

export async function generateRssFeed({
  title,
  description,
  feedPath,
  filter,
  limit = 20,
}: RssFeedOptions): Promise<NextResponse> {
  let articles = await getArticles()

  if (filter) {
    articles = articles.filter(filter)
  }

  const rssItems = articles
    .slice(0, limit)
    .map(
      (article) => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${BASE_URL}/news/${article.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/news/${article.slug}</guid>
      <pubDate>${new Date(article.date).toUTCString()}</pubDate>
      <description><![CDATA[${article.excerpt}]]></description>
      <category>${article.category}</category>
    </item>`,
    )
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <link>${BASE_URL}</link>
    <description>${description}</description>
    <language>en-us</language>
    <atom:link href="${BASE_URL}${feedPath}" rel="self" type="application/rss+xml"/>
    <copyright>\u00a9 2026 humanoidintel.ai</copyright>
    <managingEditor>editor@humanoidintel.ai (humanoidintel.ai)</managingEditor>
    <webMaster>tech@humanoidintel.ai</webMaster>
    <ttl>60</ttl>
    ${rssItems}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
