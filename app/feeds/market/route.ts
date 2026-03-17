import { generateRssFeed } from '@/lib/rss'

export const dynamic = 'force-static'

export async function GET() {
  return generateRssFeed({
    title: 'humanoidintel.ai \u2014 Market News',
    description:
      'Market news and analysis for the humanoid robotics industry.',
    feedPath: '/rss/market',
    filter: (article) => article.category === 'market',
  })
}
