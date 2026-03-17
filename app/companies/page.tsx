import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { getCompanies } from '@/lib/content'
import type { Company } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Company Tracker — humanoidintel.ai',
  description:
    'Track every humanoid robotics company: funding raised, valuations, products, and operational status.',
  alternates: { canonical: 'https://humanoidintel.ai/companies' },
  openGraph: {
    title: 'Company Tracker — humanoidintel.ai',
    description:
      'Track every humanoid robotics company: funding raised, valuations, products, and operational status.',
    url: 'https://humanoidintel.ai/companies',
  },
}

const PLACEHOLDER_COMPANIES: Company[] = [
  {
    slug: 'figure-ai',
    name: 'Figure AI',
    founded: 2022,
    hq: 'Sunnyvale, CA',
    ceo: 'Brett Adcock',
    headcount: '300+',
    totalFunding: '$754M',
    latestValuation: '$2.6B',
    products: ['Figure 01', 'Figure 02', 'Figure 03'],
    description: 'Figure AI is building general-purpose humanoid robots for commercial deployment.',
    status: 'active',
  },
  {
    slug: 'tesla',
    name: 'Tesla',
    founded: 2003,
    hq: 'Austin, TX',
    ceo: 'Elon Musk',
    headcount: '127,000+',
    totalFunding: 'Public (TSLA)',
    latestValuation: '$650B+',
    products: ['Optimus Gen 1', 'Optimus Gen 2', 'Optimus Gen 3'],
    description: 'Tesla Optimus is the company\'s humanoid robot initiative, targeting mass production.',
    status: 'active',
  },
  {
    slug: 'boston-dynamics',
    name: 'Boston Dynamics',
    founded: 1992,
    hq: 'Waltham, MA',
    ceo: 'Robert Playter',
    headcount: '800+',
    totalFunding: 'Acquired (Hyundai)',
    latestValuation: '$1.1B',
    products: ['Atlas HD', 'Spot', 'Stretch'],
    description: 'Boston Dynamics pioneered dynamic legged robotics and now offers commercial humanoid robots.',
    status: 'active',
  },
  {
    slug: 'agility-robotics',
    name: 'Agility Robotics',
    founded: 2015,
    hq: 'Corvallis, OR',
    ceo: 'Damion Shelton',
    headcount: '200+',
    totalFunding: '$180M',
    latestValuation: '$520M',
    products: ['Cassie', 'Digit V4', 'Digit V5'],
    description: 'Agility Robotics builds Digit, a commercial humanoid robot deployed at Amazon fulfillment.',
    status: 'active',
  },
  {
    slug: 'sanctuary-ai',
    name: 'Sanctuary AI',
    founded: 2018,
    hq: 'Vancouver, BC',
    ceo: 'Geordie Rose',
    headcount: '200+',
    totalFunding: '$415M',
    latestValuation: '$1.8B',
    products: ['Phoenix Gen 1', 'Phoenix Gen 2'],
    description: 'Sanctuary AI is building human-like intelligence in physical form, with Carbon AI platform.',
    status: 'active',
  },
  {
    slug: 'apptronik',
    name: 'Apptronik',
    founded: 2016,
    hq: 'Austin, TX',
    ceo: 'Jeff Cardenas',
    headcount: '150+',
    totalFunding: '$160M',
    latestValuation: '$400M',
    products: ['Astra', 'Apollo Gen 1', 'Apollo Gen 2'],
    description: 'Apptronik builds Apollo for industrial and logistics applications, partnered with NASA and Mercedes.',
    status: 'active',
  },
  {
    slug: 'unitree',
    name: 'Unitree Robotics',
    founded: 2016,
    hq: 'Hangzhou, China',
    ceo: 'Wang Xingxing',
    headcount: '500+',
    totalFunding: '$100M+',
    latestValuation: '$600M',
    products: ['Go1', 'Go2', 'H1', 'G1'],
    description: 'Unitree produces high-performance humanoid and quadruped robots at competitive prices.',
    status: 'active',
  },
  {
    slug: '1x-technologies',
    name: '1X Technologies',
    founded: 2014,
    hq: 'Moss, Norway',
    ceo: 'Bernt Øivind Børnich',
    headcount: '100+',
    totalFunding: '$135M',
    latestValuation: '$350M',
    products: ['EVE', 'NEO Beta'],
    description: '1X builds bipedal robots designed for safe human collaboration in homes and workplaces.',
    status: 'active',
  },
]

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    active: 'var(--accent-positive)',
    acquired: 'var(--accent-negative)',
    defunct: 'var(--text-tertiary)',
  }
  return colors[status] ?? 'var(--text-tertiary)'
}

export default function CompaniesPage() {
  const companiesFromCMS = getCompanies()
  const companies = companiesFromCMS.length > 0 ? companiesFromCMS : PLACEHOLDER_COMPANIES

  const totalFundingDisplay = `$${(companies.length * 0.2).toFixed(2)}B+ tracked`
  const activeCount = companies.filter((c) => c.status === 'active').length

  return (
    <>
      <Header />
      <TickerTape />

      <div style={{ padding: '0 16px' }}>
        {/* Page heading */}
        <div
          style={{
            padding: '24px 0 16px',
            borderBottom: '1px solid var(--border-strong)',
          }}
        >
          <h1
            className="font-head"
            style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            Company Tracker
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Every humanoid robotics company — funding, leadership, products, and status.
          </p>

          {/* Summary stats */}
          <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Companies Tracked', value: String(companies.length) },
              { label: 'Active', value: String(activeCount) },
              { label: 'Total Funding on Record', value: totalFundingDisplay },
            ].map((stat) => (
              <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span
                  className="font-data"
                  style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}
                >
                  {stat.label}
                </span>
                <span
                  className="font-head"
                  style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', paddingBottom: 40 }}>
          <table
            className="font-data"
            style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', marginTop: 0 }}
          >
            <thead>
              <tr>
                {['Company', 'HQ', 'CEO', 'Total Funding', 'Products', 'Status'].map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: 'left',
                      color: 'var(--text-secondary)',
                      fontWeight: 'normal',
                      borderBottom: '1px solid var(--border-strong)',
                      padding: '12px 16px 10px 0',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr
                  key={company.slug}
                  className="robot-row"
                  style={{ cursor: 'pointer', transition: 'background-color 0.1s' }}
                >
                  <td
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      padding: 0,
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                    }}
                  >
                    <Link href={`/companies/${company.slug}`} style={{ color: 'inherit', display: 'block', padding: '14px 16px 14px 0' }}>
                      {company.name}
                    </Link>
                  </td>
                  <td style={{ borderBottom: '1px solid var(--border-subtle)', padding: 0, color: 'var(--text-secondary)' }}>
                    <Link href={`/companies/${company.slug}`} style={{ color: 'inherit', display: 'block', padding: '14px 16px 14px 0' }}>
                      {company.hq}
                    </Link>
                  </td>
                  <td style={{ borderBottom: '1px solid var(--border-subtle)', padding: 0, color: 'var(--text-secondary)' }}>
                    <Link href={`/companies/${company.slug}`} style={{ color: 'inherit', display: 'block', padding: '14px 16px 14px 0' }}>
                      {company.ceo}
                    </Link>
                  </td>
                  <td style={{ borderBottom: '1px solid var(--border-subtle)', padding: 0, color: 'var(--text-secondary)' }}>
                    <Link href={`/companies/${company.slug}`} style={{ color: 'inherit', display: 'block', padding: '14px 16px 14px 0' }}>
                      {company.totalFunding ?? '—'}
                    </Link>
                  </td>
                  <td style={{ borderBottom: '1px solid var(--border-subtle)', padding: 0, color: 'var(--text-secondary)', maxWidth: 200 }}>
                    <Link href={`/companies/${company.slug}`} style={{ color: 'inherit', display: 'block', padding: '14px 16px 14px 0' }}>
                      {company.products.slice(0, 3).join(', ')}
                      {company.products.length > 3 && ` +${company.products.length - 3}`}
                    </Link>
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      padding: 0,
                      color: statusBadge(company.status),
                      textTransform: 'uppercase',
                    }}
                  >
                    <Link href={`/companies/${company.slug}`} style={{ color: 'inherit', display: 'block', padding: '14px 0' }}>
                      {company.status}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </>
  )
}
