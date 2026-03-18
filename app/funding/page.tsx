import type { Metadata } from 'next'
import { getFundingRounds } from '@/lib/content'
import { SchemaMarkup } from '@/components/SchemaMarkup'
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
    images: [{ url: 'https://humanoidintel.ai/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HumanoidIntelAI',
  },
}

const fundingSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Funding Dashboard',
  description: 'Complete funding data for every humanoid robotics company. Round sizes, valuations, lead investors, and geographic analysis.',
  url: 'https://humanoidintel.ai/funding',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://humanoidintel.ai' },
      { '@type': 'ListItem', position: 2, name: 'Funding', item: 'https://humanoidintel.ai/funding' },
    ],
  },
}

export default function FundingPage() {
  const rounds = getFundingRounds()
  return (
    <>
      <SchemaMarkup schema={fundingSchema} />
      <FundingClient rounds={rounds} />
    </>
  )
}
