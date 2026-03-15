import type { Metadata } from 'next'
import { getArticles } from '@/lib/content'
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
  },
}

export default function NewsPage() {
  const articles = getArticles()
  return <NewsClient articles={articles} />
}
