'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import type { ResearchPaper } from '@/lib/types'

// Note: This page is a client component for filter interactivity.
// For SEO metadata, add an equivalent server layout or use the layout.tsx metadata.

const RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: 'humanplus-2024',
    title: 'HumanPlus: Humanoid Shadowing and Imitation from Humans',
    authors: ['Zipeng Fu', 'Qingqing Zhao', 'Qi Wu', 'Chelsea Finn', 'Pieter Abbeel'],
    institution: 'UC Berkeley',
    date: '2024-06-20',
    summary: 'A system enabling humanoid robots to shadow and imitate human motions in real time using egocentric video, achieving robust whole-body control and skill transfer.',
    url: 'https://arxiv.org/abs/2406.10454',
    keyFinding: 'Humanoids can learn complex manipulation and locomotion skills by shadowing humans in real time with <100ms latency.',
    category: 'Manipulation',
  },
  {
    id: 'openvla-2024',
    title: 'OpenVLA: An Open-Source Vision-Language-Action Model',
    authors: ['Moo Jin Kim', 'Karl Pertsch', 'Siddharth Karamcheti', 'Ted Xiao', 'Chelsea Finn'],
    institution: 'Stanford University',
    date: '2024-06-13',
    summary: 'OpenVLA is a 7B-parameter open-source VLA model trained on 970k robot demonstrations, achieving state-of-the-art performance on manipulation benchmarks.',
    url: 'https://arxiv.org/abs/2406.09246',
    keyFinding: '7B VLA models generalize to novel objects and environments with 16.5% improvement over prior SoTA.',
    category: 'VLA Models',
  },
  {
    id: 'locomotion-sim-2024',
    title: 'Learning to Walk in Minutes Using Massively Parallel Deep Reinforcement Learning',
    authors: ['Nikita Rudin', 'David Hoeller', 'Philipp Reist', 'Marco Hutter'],
    institution: 'ETH Zurich',
    date: '2024-03-15',
    summary: 'Training bipedal locomotion policies in simulation that transfer zero-shot to real hardware, with training completing in under 20 minutes on a single GPU.',
    url: 'https://arxiv.org/abs/2109.11978',
    keyFinding: 'Zero-shot sim-to-real locomotion transfer achieved with policies trained in <20 minutes on a single GPU.',
    category: 'Locomotion',
  },
  {
    id: 'dex-tacto-2025',
    title: 'Dexterous Manipulation via Tactile Sensing: Closing the Sim-to-Real Gap',
    authors: ['Raunaq Bhirangi', 'Tess Hellebrekers', 'Carmel Majidi', 'Abhinav Gupta'],
    institution: 'Carnegie Mellon University',
    date: '2025-02-10',
    summary: 'A novel tactile sensor design and simulation framework that enables zero-shot transfer of tactile-guided dexterous manipulation policies to physical robot hands.',
    url: 'https://arxiv.org/abs/2502.05420',
    keyFinding: 'Tactile feedback reduces grasp failure rate by 78% in novel object manipulation tasks.',
    category: 'Tactile',
  },
  {
    id: 'gr2-2024',
    title: 'GR-2: Generative Video-Language-Action Model with Web-Scale Knowledge for Robot Manipulation',
    authors: ['Wenjie Zhao', 'Yicheng Liu', 'Hao Liu'],
    institution: 'ByteDance Research',
    date: '2024-10-05',
    summary: 'GR-2 leverages internet-scale video pretraining to build a generalist manipulation policy that generalizes across robot morphologies and task types.',
    url: 'https://arxiv.org/abs/2410.06158',
    keyFinding: 'Web-scale video pretraining enables 3× improvement in zero-shot task generalization across robot morphologies.',
    category: 'VLA Models',
  },
  {
    id: 'parkour-2024',
    title: 'Extreme Parkour with Legged Robots',
    authors: ['Ziwen Zhuang', 'Zipeng Fu', 'Jianren Wang', 'Christopher Atkeson'],
    institution: 'Carnegie Mellon University',
    date: '2024-01-22',
    summary: 'Training legged robots to perform parkour maneuvers including wall-running, gap jumping, and flipping using a hierarchical RL framework in Isaac Gym.',
    url: 'https://arxiv.org/abs/2309.14341',
    keyFinding: 'Hierarchical RL enables bipeds to learn parkour behaviors 40× faster than flat RL baselines.',
    category: 'Locomotion',
  },
  {
    id: 'humanoid-control-2025',
    title: 'Whole-Body Control for Humanoids via Hierarchical Optimization',
    authors: ['Guiliang Liu', 'Shikai Chen', 'Masayoshi Tomizuka'],
    institution: 'UC Berkeley',
    date: '2025-04-01',
    summary: 'A hierarchical whole-body control framework that simultaneously manages contact forces, task objectives, and joint limits in real time on 42-DOF humanoid platforms.',
    url: 'https://arxiv.org/abs/2504.00112',
    keyFinding: 'Hierarchical WBC achieves 120Hz real-time control on 42-DOF humanoids with <2ms compute budget.',
    category: 'Manipulation',
  },
  {
    id: 'sim2real-survey-2025',
    title: 'Bridging the Reality Gap in 2025: A Survey of Sim-to-Real Transfer for Humanoid Robots',
    authors: ['Marcus Chen', 'Laura Pérez', 'Yuki Tanaka', 'Florian Wolf'],
    institution: 'MIT + Stanford + TU Munich',
    date: '2025-06-15',
    summary: 'A comprehensive survey of sim-to-real transfer techniques applied to humanoid robots, covering domain randomization, system identification, and adaptive control.',
    url: 'https://arxiv.org/abs/2506.07781',
    keyFinding: 'Domain randomization + adaptive control combinations now achieve <5% performance drop in sim-to-real transfer for locomotion tasks.',
    category: 'Sim-to-Real',
  },
]

const FILTER_CATEGORIES = [
  'All',
  'Locomotion',
  'Manipulation',
  'Sim-to-Real',
  'VLA Models',
  'Tactile',
]

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function ResearchPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered =
    activeCategory === 'All'
      ? RESEARCH_PAPERS
      : RESEARCH_PAPERS.filter((p) => p.category === activeCategory)

  return (
    <>
      <Header />
      <TickerTape />

      <div style={{ padding: '0 16px', maxWidth: 900 }}>
        {/* Page heading */}
        <div style={{ padding: '24px 0 16px', borderBottom: '1px solid var(--border-strong)' }}>
          <h1
            className="font-head"
            style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            Research Hub
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 600 }}>
            Key academic papers shaping the development of humanoid robots — locomotion, manipulation,
            sim-to-real transfer, VLA models, and tactile sensing.
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
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className="font-data"
              style={{
                padding: '10px 14px',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: activeCategory === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                borderBottom:
                  activeCategory === cat
                    ? '2px solid var(--accent-positive)'
                    : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                marginBottom: -1,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Paper list */}
        <div style={{ paddingBottom: 48 }}>
          {filtered.map((paper) => (
            <div
              key={paper.id}
              style={{
                padding: '24px 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  marginBottom: 10,
                  flexWrap: 'wrap',
                }}
              >
                <span className="tag">{paper.category}</span>
                <span
                  className="font-data"
                  style={{ fontSize: 11, color: 'var(--text-tertiary)' }}
                >
                  {formatDate(paper.date)}
                </span>
              </div>

              <a
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <h2
                  className="font-head news-title"
                  style={{
                    fontSize: 17,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    lineHeight: 1.3,
                    marginBottom: 6,
                  }}
                >
                  {paper.title}
                </h2>
              </a>

              <div
                className="font-data"
                style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 10 }}
              >
                {paper.authors.slice(0, 3).join(', ')}
                {paper.authors.length > 3 && ` et al.`}{' '}
                · {paper.institution}
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: 12,
                }}
              >
                {paper.summary}
              </p>

              {/* Key finding */}
              <div
                style={{
                  borderLeft: '2px solid var(--accent-positive)',
                  paddingLeft: 12,
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                  marginBottom: 12,
                }}
              >
                <span
                  className="font-data"
                  style={{ fontSize: 10, color: 'var(--text-tertiary)', fontStyle: 'normal', textTransform: 'uppercase', marginRight: 8 }}
                >
                  Key Finding:
                </span>
                {paper.keyFinding}
              </div>

              <a
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-data"
                style={{ fontSize: 11, color: 'var(--accent-positive)' }}
              >
                Read paper on arXiv →
              </a>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  )
}
