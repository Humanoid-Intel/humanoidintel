import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TickerTape from '@/components/TickerTape'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { getSupplyChainRelationships } from '@/lib/content'
import SupplyChainClient from './SupplyChainClient'

export const metadata: Metadata = {
  title: 'Supply Chain Intelligence — humanoidintel.ai',
  description:
    'Tracking key suppliers powering the humanoid robotics industry — chips, actuators, sensors, batteries, hands, and AI software.',
  alternates: { canonical: 'https://humanoidintel.ai/supply-chain' },
  openGraph: {
    title: 'Supply Chain Intelligence — humanoidintel.ai',
    description:
      'Tracking key suppliers powering the humanoid robotics industry.',
    url: 'https://humanoidintel.ai/supply-chain',
    images: [{ url: 'https://humanoidintel.ai/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HumanoidIntelAI',
  },
}

interface Supplier {
  company: string
  products: string[]
  customers: string[]
  hq: string
  criticality: 'critical' | 'high' | 'medium'
}

interface SupplyCategory {
  category: string
  suppliers: Supplier[]
}

function getSupplyChainData(): SupplyCategory[] {
  const filePath = path.join(process.cwd(), 'content', 'data', 'supply-chain.json')
  if (!fs.existsSync(filePath)) return []
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as SupplyCategory[]
  } catch {
    return []
  }
}

export default function SupplyChainPage() {
  const data = getSupplyChainData()
  const relationships = getSupplyChainRelationships()

  return (
    <>
      <SchemaMarkup
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://humanoidintel.ai',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Supply Chain',
              item: 'https://humanoidintel.ai/supply-chain',
            },
          ],
        }}
      />
      <SchemaMarkup
        schema={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Supply Chain Intelligence — humanoidintel.ai',
          description:
            'Tracking key suppliers powering the humanoid robotics industry — chips, actuators, sensors, batteries, hands, and AI software.',
          url: 'https://humanoidintel.ai/supply-chain',
        }}
      />
      <Header />
      <TickerTape />

      <SupplyChainClient data={data} relationships={relationships} />

      <Footer />
    </>
  )
}
