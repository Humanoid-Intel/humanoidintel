'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import type { Robot } from '@/lib/types'

const PLACEHOLDER_ROBOTS: Robot[] = [
  {
    slug: 'figure-03',
    name: 'Figure 03',
    manufacturer: 'Figure AI',
    country: 'USA',
    status: 'commercial',
    height: '1.70m',
    weight: '60kg',
    dof: 44,
    payload: '20kg',
    battery: '5hrs',
    actuatorType: 'Electric',
    description: 'Third-generation commercial humanoid robot deployed at BMW manufacturing plants.',
  },
  {
    slug: 'optimus-gen3',
    name: 'Optimus Gen 3',
    manufacturer: 'Tesla',
    country: 'USA',
    status: 'pilot',
    height: '1.73m',
    weight: '57kg',
    dof: 40,
    payload: '20kg',
    battery: '8hrs',
    actuatorType: 'Electric',
    description: 'Tesla\'s third-generation humanoid robot, piloting in Fremont and Giga Texas facilities.',
  },
  {
    slug: 'atlas-hd',
    name: 'Atlas HD',
    manufacturer: 'Boston Dynamics',
    country: 'USA',
    status: 'commercial',
    height: '1.80m',
    weight: '89kg',
    dof: 28,
    payload: '25kg',
    battery: '4hrs',
    actuatorType: 'Electric',
    description: 'The all-electric Atlas, built for strength and dexterity in industrial settings.',
  },
  {
    slug: 'digit-v5',
    name: 'Digit V5',
    manufacturer: 'Agility Robotics',
    country: 'USA',
    status: 'pilot',
    height: '1.75m',
    weight: '65kg',
    dof: 32,
    payload: '16kg',
    battery: '4hrs',
    actuatorType: 'Electric',
    description: 'Digit V5 is deployed at Amazon fulfillment centers for logistics tasks.',
  },
  {
    slug: 'unitree-h1',
    name: 'H1',
    manufacturer: 'Unitree',
    country: 'China',
    status: 'commercial',
    height: '1.80m',
    weight: '47kg',
    dof: 27,
    payload: '30kg',
    battery: '3.5hrs',
    actuatorType: 'Electric',
    description: 'Unitree\'s H1 is among the most commercially deployed humanoid robots globally.',
  },
  {
    slug: 'phoenix-gen2',
    name: 'Phoenix Gen 2',
    manufacturer: 'Sanctuary AI',
    country: 'Canada',
    status: 'pilot',
    height: '1.68m',
    weight: '70kg',
    dof: 20,
    payload: '25kg',
    battery: '5hrs',
    actuatorType: 'Hydraulic/Electric',
    description: 'Sanctuary AI\'s Phoenix focuses on general-purpose manipulation with a carbon-based AI.',
  },
  {
    slug: 'apollo-gen2',
    name: 'Apollo Gen 2',
    manufacturer: 'Apptronik',
    country: 'USA',
    status: 'pilot',
    height: '1.73m',
    weight: '73kg',
    dof: 34,
    payload: '25kg',
    battery: '4hrs',
    actuatorType: 'Electric',
    description: 'Apptronik\'s Apollo is collaborating with NASA and Mercedes-Benz on advanced industrial tasks.',
  },
  {
    slug: 'neo-beta',
    name: 'NEO Beta',
    manufacturer: '1X Technologies',
    country: 'Norway',
    status: 'r&d',
    height: '1.65m',
    weight: '30kg',
    dof: 24,
    payload: '10kg',
    battery: '6hrs',
    actuatorType: 'Electric',
    description: '1X\'s NEO Beta is an ultra-lightweight humanoid focused on home assistance applications.',
  },
]

type SortKey = 'name' | 'manufacturer' | 'country' | 'status' | 'payload' | 'dof'

const FILTER_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Pilot', value: 'pilot' },
  { label: 'Prototype', value: 'prototype' },
  { label: 'R&D', value: 'r&d' },
  { label: 'China', value: 'china' },
  { label: 'USA', value: 'usa' },
  { label: 'Europe', value: 'europe' },
]

const EUROPE_COUNTRIES = ['norway', 'germany', 'france', 'uk', 'sweden', 'netherlands', 'spain', 'italy']

function statusClass(status: string) {
  return ['commercial', 'pilot', 'production'].includes(status) ? 'data-pos' : 'data-neg'
}

interface Props {
  robots: Robot[]
}

export default function RobotsClient({ robots }: Props) {
  const source = robots.length > 0 ? robots : PLACEHOLDER_ROBOTS

  const [filter, setFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortAsc, setSortAsc] = useState(true)

  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const filtered = useMemo(() => {
    return source.filter((r) => {
      if (filter === 'all') return true
      if (['commercial', 'pilot', 'prototype', 'r&d'].includes(filter)) return r.status === filter
      if (filter === 'china') return r.country.toLowerCase() === 'china'
      if (filter === 'usa') return r.country.toLowerCase() === 'usa'
      if (filter === 'europe') return EUROPE_COUNTRIES.includes(r.country.toLowerCase())
      return true
    })
  }, [source, filter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: string | number = ''
      let valB: string | number = ''

      if (sortKey === 'name') { valA = a.name; valB = b.name }
      else if (sortKey === 'manufacturer') { valA = a.manufacturer; valB = b.manufacturer }
      else if (sortKey === 'country') { valA = a.country; valB = b.country }
      else if (sortKey === 'status') { valA = a.status; valB = b.status }
      else if (sortKey === 'dof') { valA = a.dof ?? 0; valB = b.dof ?? 0 }
      else if (sortKey === 'payload') {
        valA = parseFloat(a.payload ?? '0')
        valB = parseFloat(b.payload ?? '0')
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA))
    })
  }, [filtered, sortKey, sortAsc])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((a) => !a)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  function SortIndicator({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span style={{ color: 'var(--border-strong)' }}> ↕</span>
    return <span style={{ color: 'var(--accent-positive)' }}> {sortAsc ? '↑' : '↓'}</span>
  }

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
            Robot Database
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 600 }}>
            The definitive database of every humanoid robot in development or production.
            Specifications, deployment status, and manufacturer data.
          </p>
          <p
            className="font-data"
            style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}
          >
            Last updated: {lastUpdated} · {source.length} robots tracked
          </p>
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: '1px solid var(--border-subtle)',
            overflowX: 'auto',
            marginBottom: 0,
          }}
          className="no-scrollbar"
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className="font-data"
              style={{
                padding: '10px 14px',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: filter === tab.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                borderBottom:
                  filter === tab.value
                    ? '2px solid var(--accent-positive)'
                    : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', paddingBottom: 40 }}>
          <table
            className="font-data"
            style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', marginTop: 0 }}
          >
            <thead>
              <tr>
                {(
                  [
                    { label: 'Model', key: 'name' },
                    { label: 'Manufacturer', key: 'manufacturer' },
                    { label: 'Country', key: 'country' },
                    { label: 'Height', key: null },
                    { label: 'Weight', key: null },
                    { label: 'DOF', key: 'dof' },
                    { label: 'Payload', key: 'payload' },
                    { label: 'Battery', key: null },
                    { label: 'Actuation', key: null },
                    { label: 'Status', key: 'status' },
                  ] as { label: string; key: SortKey | null }[]
                ).map((col) => (
                  <th
                    key={col.label}
                    onClick={() => col.key && handleSort(col.key)}
                    style={{
                      textAlign: 'left',
                      color: 'var(--text-secondary)',
                      fontWeight: 'normal',
                      borderBottom: '1px solid var(--border-strong)',
                      padding: '12px 12px 10px 0',
                      paddingRight: 16,
                      whiteSpace: 'nowrap',
                      cursor: col.key ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    {col.label}
                    {col.key && <SortIndicator col={col.key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      textAlign: 'center',
                      padding: '40px 0',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    No robots match this filter.
                  </td>
                </tr>
              ) : (
                sorted.map((robot) => (
                  <tr
                    key={robot.slug}
                    style={{ cursor: 'pointer', transition: 'background-color 0.1s' }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        'var(--bg-hover)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        'transparent'
                    }}
                  >
                    <td
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        padding: '12px 16px 12px 0',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                      }}
                    >
                      <Link href={`/robots/${robot.slug}`} style={{ color: 'inherit' }}>
                        {robot.name}
                      </Link>
                    </td>
                    <td style={{ borderBottom: '1px solid var(--border-subtle)', padding: '12px 16px 12px 0', color: 'var(--text-secondary)' }}>
                      {robot.manufacturer}
                    </td>
                    <td style={{ borderBottom: '1px solid var(--border-subtle)', padding: '12px 16px 12px 0', color: 'var(--text-secondary)' }}>
                      {robot.country}
                    </td>
                    <td style={{ borderBottom: '1px solid var(--border-subtle)', padding: '12px 16px 12px 0', color: 'var(--text-secondary)' }}>
                      {robot.height ?? '—'}
                    </td>
                    <td style={{ borderBottom: '1px solid var(--border-subtle)', padding: '12px 16px 12px 0', color: 'var(--text-secondary)' }}>
                      {robot.weight ?? '—'}
                    </td>
                    <td style={{ borderBottom: '1px solid var(--border-subtle)', padding: '12px 16px 12px 0', color: 'var(--text-secondary)' }}>
                      {robot.dof ?? '—'}
                    </td>
                    <td style={{ borderBottom: '1px solid var(--border-subtle)', padding: '12px 16px 12px 0', color: 'var(--text-secondary)' }}>
                      {robot.payload ?? '—'}
                    </td>
                    <td style={{ borderBottom: '1px solid var(--border-subtle)', padding: '12px 16px 12px 0', color: 'var(--text-secondary)' }}>
                      {robot.battery ?? '—'}
                    </td>
                    <td style={{ borderBottom: '1px solid var(--border-subtle)', padding: '12px 16px 12px 0', color: 'var(--text-secondary)' }}>
                      {robot.actuatorType}
                    </td>
                    <td
                      style={{ borderBottom: '1px solid var(--border-subtle)', padding: '12px 0' }}
                      className={statusClass(robot.status)}
                    >
                      {robot.status.toUpperCase()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </>
  )
}
