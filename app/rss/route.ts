import { generateRssFeed } from '@/lib/rss'

export const dynamic = 'force-static'

export async function GET() {
  return generateRssFeed({
    title: 'humanoidintel.ai \u2014 Humanoid Robotics Intelligence',
    description:
      'The definitive intelligence platform for humanoid robotics. Real-time news, funding data, robot profiles, and market analysis.',
    feedPath: '/rss',
  })
}
