import type { Metadata } from 'next'
import { getBrains } from '@/lib/content'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import BrainsClient from './BrainsClient'

export const metadata: Metadata = {
  title: 'Brain Database — humanoidintel.ai',
  description:
    'The definitive database of AI brains and foundation models powering humanoid robots. Architecture, parameters, training data, and deployment status.',
  alternates: { canonical: 'https://humanoidintel.ai/brains' },
  openGraph: {
    title: 'Brain Database — humanoidintel.ai',
    description:
      'The definitive database of AI brains and foundation models powering humanoid robots.',
    url: 'https://humanoidintel.ai/brains',
    images: [{ url: 'https://humanoidintel.ai/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HumanoidIntelAI',
  },
}

const brainsSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Brain Database',
  description: 'The definitive database of AI brains and foundation models powering humanoid robots. Architecture, parameters, training data, and deployment status.',
  url: 'https://humanoidintel.ai/brains',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://humanoidintel.ai' },
      { '@type': 'ListItem', position: 2, name: 'Brain Database', item: 'https://humanoidintel.ai/brains' },
    ],
  },
}

export default function BrainsPage() {
  const brains = getBrains()
  return (
    <>
      <SchemaMarkup schema={brainsSchema} />
      <BrainsClient brains={brains} />
    </>
  )
}
