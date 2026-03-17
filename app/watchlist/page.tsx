import type { Metadata } from 'next'
import { getArticles, getCompanies, getFundingRounds } from '@/lib/content'
import WatchlistClient from './WatchlistClient'

export const metadata: Metadata = {
  title: 'My Watchlist — humanoidintel.ai',
  description:
    'Track your favorite humanoid robotics companies, their latest news, and funding activity.',
  alternates: { canonical: 'https://humanoidintel.ai/watchlist' },
  openGraph: {
    title: 'My Watchlist — humanoidintel.ai',
    description:
      'Track your favorite humanoid robotics companies, their latest news, and funding activity.',
    url: 'https://humanoidintel.ai/watchlist',
  },
}

export default function WatchlistPage() {
  const articles = getArticles()
  const companies = getCompanies()
  const fundingRounds = getFundingRounds()

  return (
    <WatchlistClient
      articles={articles}
      companies={companies}
      fundingRounds={fundingRounds}
    />
  )
}
