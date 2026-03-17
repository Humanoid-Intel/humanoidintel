import type { Metadata } from 'next'
import { getRobots } from '@/lib/content'
import CompareClient from './CompareClient'

export const metadata: Metadata = {
  title: 'Compare Humanoid Robots — humanoidintel.ai',
  description:
    'Side-by-side comparison of humanoid robot specifications. Compare height, weight, DOF, payload, battery life, and actuator type across leading platforms.',
  alternates: { canonical: 'https://humanoidintel.ai/compare' },
  openGraph: {
    title: 'Compare Humanoid Robots — humanoidintel.ai',
    description:
      'Side-by-side comparison of humanoid robot specifications across leading platforms.',
    url: 'https://humanoidintel.ai/compare',
  },
}

export default function ComparePage() {
  const robots = getRobots()
  return <CompareClient robots={robots} />
}
