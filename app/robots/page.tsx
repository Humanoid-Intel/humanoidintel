import type { Metadata } from 'next'
import { getRobots } from '@/lib/content'
import RobotsClient from './RobotsClient'

export const metadata: Metadata = {
  title: 'Robot Database — humanoidintel.ai',
  description:
    'The definitive database of every humanoid robot in development or production. Specs, status, manufacturers, and deployment data.',
  alternates: { canonical: 'https://humanoidintel.ai/robots' },
  openGraph: {
    title: 'Robot Database — humanoidintel.ai',
    description:
      'The definitive database of every humanoid robot in development or production.',
    url: 'https://humanoidintel.ai/robots',
  },
}

export default function RobotsPage() {
  const robots = getRobots()
  return <RobotsClient robots={robots} />
}
