import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { getGlossaryTerms } from '@/lib/content'
import type { GlossaryTerm } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Humanoid Robotics Glossary — humanoidintel.ai',
  description:
    'The definitive reference for humanoid robotics terminology. Definitions for every term in hardware, software, AI, and mechanical design.',
  alternates: { canonical: 'https://humanoidintel.ai/glossary' },
  openGraph: {
    title: 'Humanoid Robotics Glossary — humanoidintel.ai',
    description:
      'The definitive reference for humanoid robotics terminology.',
    url: 'https://humanoidintel.ai/glossary',
    images: [{ url: 'https://humanoidintel.ai/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HumanoidIntelAI',
  },
}

const PLACEHOLDER_TERMS: GlossaryTerm[] = [
  { slug: 'degrees-of-freedom', term: 'Degrees of Freedom (DOF)', definition: 'The number of independent parameters that define the configuration of a mechanical system. Higher DOF enables more complex and human-like motion.', category: 'Hardware' },
  { slug: 'actuator', term: 'Actuator', definition: 'A device that converts energy (electrical, hydraulic, pneumatic) into mechanical motion. The primary driver of limb and joint movement in humanoid robots.', category: 'Hardware' },
  { slug: 'harmonic-drive', term: 'Harmonic Drive', definition: 'A compact, high-ratio gear mechanism used in robot joints for its zero-backlash properties and high torque density.', category: 'Hardware' },
  { slug: 'payload-capacity', term: 'Payload Capacity', definition: 'The maximum weight a robot can safely carry or manipulate. A key commercial specification for industrial humanoid robots.', category: 'Hardware' },
  { slug: 'imu', term: 'Inertial Measurement Unit (IMU)', definition: 'A sensor that measures acceleration and angular velocity, critical for balance control and orientation estimation in bipedal robots.', category: 'Hardware' },
  { slug: 'sim-to-real', term: 'Sim-to-Real Transfer', definition: 'The process of training a robot\'s control policy in simulation and deploying it in the physical world. Closing the "reality gap" is a central challenge in robotics AI.', category: 'AI' },
  { slug: 'vla-model', term: 'Vision-Language-Action (VLA) Model', definition: 'A neural network architecture that processes visual inputs and natural language instructions to generate robot actions. State-of-the-art approach for general-purpose robot control.', category: 'AI' },
  { slug: 'reinforcement-learning', term: 'Reinforcement Learning (RL)', definition: 'A machine learning paradigm where an agent learns to behave in an environment by maximizing cumulative reward. Widely used for locomotion and manipulation policy training.', category: 'AI' },
  { slug: 'inverse-kinematics', term: 'Inverse Kinematics (IK)', definition: 'The computational process of determining joint angles required to place a robot\'s end-effector at a desired position and orientation.', category: 'Software' },
  { slug: 'trajectory-planning', term: 'Trajectory Planning', definition: 'The generation of smooth, collision-free paths for robot motion between configurations. Essential for safe human-robot collaboration.', category: 'Software' },
  { slug: 'whole-body-control', term: 'Whole-Body Control (WBC)', definition: 'A control framework that simultaneously manages all joints and contacts of a robot to execute tasks while satisfying physical constraints.', category: 'Software' },
  { slug: 'tactile-sensing', term: 'Tactile Sensing', definition: 'The ability to detect contact, pressure, texture, and slip via sensors embedded in robot fingers or skin. Critical for dexterous manipulation.', category: 'Hardware' },
]

function normalizeCategory(cat: string): string {
  const trimmed = cat.trim()
  if (trimmed.toUpperCase() === 'AI') return 'AI'
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

function groupByCategory(terms: GlossaryTerm[]) {
  const groups: Record<string, GlossaryTerm[]> = {}
  for (const term of terms) {
    const cat = normalizeCategory(term.category || 'Other')
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(term)
  }
  return groups
}

export default function GlossaryPage() {
  const termsFromCMS = getGlossaryTerms()
  const terms = termsFromCMS.length > 0 ? termsFromCMS : PLACEHOLDER_TERMS
  const grouped = groupByCategory(terms)
  const categories = Object.keys(grouped).sort()

  const glossarySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Humanoid Robotics Glossary',
    description: 'The definitive reference for humanoid robotics terminology. Definitions for every term in hardware, software, AI, and mechanical design.',
    url: 'https://humanoidintel.ai/glossary',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://humanoidintel.ai' },
        { '@type': 'ListItem', position: 2, name: 'Glossary', item: 'https://humanoidintel.ai/glossary' },
      ],
    },
  }

  return (
    <>
      <SchemaMarkup schema={glossarySchema} />
      <Header />
      <TickerTape />

      <div style={{ padding: '0 16px', maxWidth: 900 }}>
        {/* Page heading */}
        <div
          style={{ padding: '24px 0 16px', borderBottom: '1px solid var(--border-strong)' }}
        >
          <h1
            className="font-head"
            style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            Humanoid Robotics Glossary
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 600 }}>
            The definitive reference for humanoid robotics terminology — hardware, software, AI, and
            mechanical design.
          </p>
          <div
            className="font-data"
            style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}
          >
            {terms.length} terms defined · {categories.length} categories
          </div>
        </div>

        {/* Category jump links */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '12px 0',
            borderBottom: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
          }}
        >
          {categories.map((cat) => (
            <a
              key={cat}
              href={`#${cat.toLowerCase()}`}
              className="tag"
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              {cat}
            </a>
          ))}
        </div>

        {/* Terms by category */}
        {categories.map((cat) => (
          <section key={cat} id={cat.toLowerCase()} style={{ marginTop: 32, marginBottom: 16 }}>
            <div
              className="panel-title"
              style={{
                marginBottom: 16,
                fontSize: 13,
                paddingBottom: 8,
                borderBottom: '1px solid var(--border-strong)',
              }}
            >
              {cat}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {grouped[cat].map((term) => (
                <Link
                  key={term.slug}
                  href={`/glossary/${term.slug}`}
                  style={{ display: 'block', textDecoration: 'none' }}
                >
                  <div
                    className="news-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '220px 1fr auto',
                      gap: 16,
                      alignItems: 'center',
                      paddingTop: 14,
                      paddingBottom: 14,
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.1s',
                    }}
                  >
                    <span
                      style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}
                    >
                      {term.term}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {term.definition}
                    </span>
                    <span
                      className="font-data"
                      style={{ fontSize: 11, color: 'var(--accent-positive)', whiteSpace: 'nowrap' }}
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div style={{ paddingBottom: 48 }} />
      </div>

      <Footer />
    </>
  )
}
