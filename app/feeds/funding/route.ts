import { generateRssFeed } from '@/lib/rss'

export const dynamic = 'force-static'

export async function GET() {
  return generateRssFeed({
    title: 'humanoidintel.ai \u2014 Funding',
    description:
      'Funding rounds and investment news in humanoid robotics.',
    feedPath: '/rss/funding',
    filter: (article) =>
      article.category === 'market' && article.tags.includes('funding'),
  })
}
