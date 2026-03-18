import type { Metadata } from 'next'
import { getRobots } from '@/lib/content'
import { SchemaMarkup } from '@/components/SchemaMarkup'
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
    images: [{ url: 'https://humanoidintel.ai/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HumanoidIntelAI',
  },
}

const compareSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Compare Humanoid Robots',
  description:
    'Side-by-side comparison of humanoid robot specifications. Compare height, weight, DOF, payload, battery life, and actuator type across leading platforms.',
  url: 'https://humanoidintel.ai/compare',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://humanoidintel.ai' },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://humanoidintel.ai/compare' },
    ],
  },
}

export default function ComparePage() {
  const robots = getRobots()
  return (
    <>
      <SchemaMarkup schema={compareSchema} />
      <CompareClient robots={robots} />
    </>
  )
}
