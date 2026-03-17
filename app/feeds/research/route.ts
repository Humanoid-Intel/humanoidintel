import { generateRssFeed } from '@/lib/rss'

export const dynamic = 'force-static'

export async function GET() {
  return generateRssFeed({
    title: 'humanoidintel.ai \u2014 Research',
    description:
      'Research news and breakthroughs in humanoid robotics.',
    feedPath: '/rss/research',
    filter: (article) => article.category === 'research',
  })
}
