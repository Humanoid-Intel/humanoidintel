import type { Metadata } from 'next'
import { getRobots } from '@/lib/content'
import { SchemaMarkup } from '@/components/SchemaMarkup'
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

const robotsSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Robot Database',
  description: 'The definitive database of every humanoid robot in development or production. Specs, status, manufacturers, and deployment data.',
  url: 'https://humanoidintel.ai/robots',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://humanoidintel.ai' },
      { '@type': 'ListItem', position: 2, name: 'Robot Database', item: 'https://humanoidintel.ai/robots' },
    ],
  },
}

export default function RobotsPage() {
  const robots = getRobots()
  return (
    <>
      <SchemaMarkup schema={robotsSchema} />
      <RobotsClient robots={robots} />
    </>
  )
}
