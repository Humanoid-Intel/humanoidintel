import type { Metadata } from 'next'
import { getFundingRounds } from '@/lib/content'
import FundingClient from './FundingClient'

export const metadata: Metadata = {
  title: 'Funding Dashboard — humanoidintel.ai',
  description:
    'Complete funding data for every humanoid robotics company. Round sizes, valuations, lead investors, and geographic analysis.',
  alternates: { canonical: 'https://humanoidintel.ai/funding' },
  openGraph: {
    title: 'Funding Dashboard — humanoidintel.ai',
    description:
      'Complete funding data for every humanoid robotics company.',
    url: 'https://humanoidintel.ai/funding',
  },
}

export default function FundingPage() {
  const rounds = getFundingRounds()
  return <FundingClient rounds={rounds} />
}
