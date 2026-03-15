import { NextResponse } from 'next/server'
import { getArticles } from '@/lib/content'

export const dynamic = 'force-static'

export async function GET() {
  const articles = await getArticles()
  const baseUrl = 'https://humanoidintel.ai'

  const rssItems = articles
    .slice(0, 20)
    .map(
      (article) => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/news/${article.slug}</link>
      <guid isPermaLink="true">${baseUrl}/news/${article.slug}</guid>
      <pubDate>${new Date(article.date).toUTCString()}</pubDate>
      <description><![CDATA[${article.excerpt}]]></description>
      <category>${article.category}</category>
    </item>`,
    )
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>humanoidintel.ai — Humanoid Robotics Intelligence</title>
    <link>${baseUrl}</link>
    <description>The definitive intelligence platform for humanoid robotics. Real-time news, funding data, robot profiles, and market analysis.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml"/>
    <copyright>© 2026 humanoidintel.ai</copyright>
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
