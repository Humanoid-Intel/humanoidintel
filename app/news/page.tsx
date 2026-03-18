import type { Metadata } from 'next'
import { getArticles } from '@/lib/content'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import NewsClient from './NewsClient'

export const metadata: Metadata = {
  title: 'Newsfeed — humanoidintel.ai',
  description:
    'Real-time humanoid robotics news: funding rounds, product launches, research breakthroughs, and policy updates.',
  alternates: { canonical: 'https://humanoidintel.ai/news' },
  openGraph: {
    title: 'Newsfeed — humanoidintel.ai',
    description:
      'Real-time humanoid robotics news: funding rounds, product launches, research breakthroughs, and policy updates.',
    url: 'https://humanoidintel.ai/news',
    images: [{ url: 'https://humanoidintel.ai/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HumanoidIntelAI',
  },
}

const newsSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Newsfeed',
  description: 'Real-time humanoid robotics news: funding rounds, product launches, research breakthroughs, and policy updates.',
  url: 'https://humanoidintel.ai/news',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://humanoidintel.ai' },
      { '@type': 'ListItem', position: 2, name: 'Newsfeed', item: 'https://humanoidintel.ai/news' },
    ],
  },
}

export default function NewsPage() {
  const articles = getArticles()
  return (
    <>
      <SchemaMarkup schema={newsSchema} />
      <NewsClient articles={articles} />
    </>
  )
}
