import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TickerTape from '@/components/TickerTape'
import { SchemaMarkup } from '@/components/SchemaMarkup'

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

/* Map customer display names to company slugs where a page exists */
const customerSlugMap: Record<string, string> = {
  'Figure AI': 'figure-ai',
  'Agility Robotics': 'agility-robotics',
  'Agility': 'agility-robotics',
  'Apptronik': 'apptronik',
  'NEURA Robotics': 'neura-robotics',
  'NEURA': 'neura-robotics',
  'Unitree': 'unitree-robotics',
  'Galbot': 'galbot',
  '1X Technologies': '1x-technologies',
  'Fourier': 'fourier-intelligence',
  'Kepler': 'kepler',
  'Boston Dynamics': 'boston-dynamics',
  'Sanctuary AI': 'sanctuary-ai',
  'Tesla Optimus': 'tesla-optimus',
  'Agibot': 'agibot',
  'Samsung': 'samsung',
  'ABB': 'abb',
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

function criticalityColor(level: string): string {
  switch (level) {
    case 'critical':
      return 'var(--accent-negative)'
    case 'high':
      return '#d4a843'
    default:
      return 'var(--text-secondary)'
  }
}

export default function SupplyChainPage() {
  const data = getSupplyChainData()

  const totalSuppliers = data.reduce((n, cat) => n + cat.suppliers.length, 0)
  const totalCategories = data.length
  const allCustomers = new Set<string>()
  data.forEach((cat) =>
    cat.suppliers.forEach((s) =>
      s.customers.forEach((c) => allCustomers.add(c)),
    ),
  )

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

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 64px' }}>
        {/* Page title */}
        <div style={{ padding: '32px 0 24px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Supply Chain Intelligence
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 12,
              color: 'var(--text-tertiary)',
              marginTop: 6,
            }}
          >
            Key suppliers and components powering the humanoid robotics industry
          </p>
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            backgroundColor: 'var(--border-subtle)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 24,
          }}
        >
          {[
            { label: 'Suppliers Tracked', value: totalSuppliers },
            { label: 'Categories', value: totalCategories },
            { label: 'Customer Relationships', value: allCustomers.size },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: 'var(--bg-panel)',
                padding: '14px 16px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: 11,
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 4,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: 26,
                  fontWeight: 700,
                  color: 'var(--accent-positive)',
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Category panels */}
        {data.map((cat) => (
          <section
            key={cat.category}
            style={{
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 16,
            }}
          >
            {/* Category header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                {cat.category}
              </h2>
              <span
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: 11,
                  color: 'var(--text-tertiary)',
                }}
              >
                {cat.suppliers.length} supplier{cat.suppliers.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontFamily: 'var(--font-data)',
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    {['Supplier', 'Products', 'Key Customers', 'HQ', 'Criticality'].map(
                      (col) => (
                        <th
                          key={col}
                          style={{
                            padding: '8px 12px',
                            textAlign: 'left',
                            fontWeight: 600,
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: 'var(--text-tertiary)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {col}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {cat.suppliers.map((supplier) => (
                    <tr
                      key={supplier.company}
                      className="robot-row"
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.1s',
                      }}
                    >
                      {/* Supplier name */}
                      <td
                        style={{
                          padding: '10px 12px',
                          color: 'var(--text-primary)',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {supplier.company}
                      </td>

                      {/* Products as tags */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {supplier.products.map((product) => (
                            <span
                              key={product}
                              style={{
                                display: 'inline-block',
                                padding: '2px 6px',
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-subtle)',
                                fontSize: 10,
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {product}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Key Customers */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px' }}>
                          {supplier.customers.map((customer, i) => {
                            const slug = customerSlugMap[customer]
                            return (
                              <span key={i}>
                                {slug ? (
                                  <Link
                                    href={`/companies/${slug}`}
                                    style={{
                                      color: 'var(--accent-positive)',
                                      fontSize: 11,
                                    }}
                                  >
                                    {customer}
                                  </Link>
                                ) : (
                                  <span
                                    style={{
                                      color: 'var(--text-secondary)',
                                      fontSize: 11,
                                    }}
                                  >
                                    {customer}
                                  </span>
                                )}
                              </span>
                            )
                          })}
                        </div>
                      </td>

                      {/* HQ */}
                      <td
                        style={{
                          padding: '10px 12px',
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {supplier.hq}
                      </td>

                      {/* Criticality */}
                      <td
                        style={{
                          padding: '10px 12px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          fontSize: 10,
                          letterSpacing: '0.05em',
                          color: criticalityColor(supplier.criticality),
                        }}
                      >
                        {supplier.criticality}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </>
  )
}
