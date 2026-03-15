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
    id: 'xhugwbc-2026',
    title: 'Scalable and General Whole-Body Control for Cross-Humanoid Locomotion (XHugWBC)',
    authors: ['Yufei Xue', 'Yunfeng Lin', 'Wentao Dong', 'Yang Tang', 'Jingbo Wang', 'Jiangmiao Pang', 'Ming Zhou', 'Minghuan Liu', 'Weinan Zhang'],
    institution: 'Shanghai AI Lab / Shanghai Jiao Tong University',
    date: '2026-02-05',
    summary: 'XHugWBC trains a single policy that generalizes whole-body locomotion and manipulation across diverse humanoid hardware — without robot-specific retraining. Key innovations include physics-consistent morphological randomization and semantically aligned observation/action spaces across architectures. Validated across 12 simulated and 7 real-world humanoid platforms.',
    url: 'https://arxiv.org/abs/2602.05791',
    keyFinding: '100% zero-shot success rate across 7 real humanoid platforms despite large hardware variation. Accepted to ICML.',
    category: 'Locomotion',
  },
  {
    id: 'wholebodyvla-2025',
    title: 'WholeBodyVLA: Towards Unified Latent VLA for Whole-Body Loco-Manipulation Control',
    authors: ['Haoran Jiang', 'Jin Chen', 'Qingwen Bu', 'Li Chen', 'Modi Shi'],
    institution: 'Fudan University / OpenDriveLab & MMLab @ HKU / AgiBot',
    date: '2025-12-11',
    summary: 'A unified latent VLA framework for simultaneous locomotion and manipulation. The model learns from large quantities of action-free egocentric video paired with a loco-manipulation RL policy — dramatically reducing the cost of training data collection. Validated on the AgiBot X2 humanoid.',
    url: 'https://arxiv.org/abs/2512.11047',
    keyFinding: 'Outperforms prior baselines by 21.3% with strong generalization across a broad range of loco-manipulation tasks.',
    category: 'VLA Models',
  },
  {
    id: 'groot-n1-2025',
    title: 'GR00T N1: An Open Foundation Model for Generalist Humanoid Robots',
    authors: ['Johan Bjorck', 'Linxi Fan', 'Yuke Zhu'],
    institution: 'NVIDIA Research',
    date: '2025-03-18',
    summary: 'GR00T N1 is a 2.2B-parameter open foundation model built on a dual-system architecture — an Eagle-2 VLM for environmental understanding and a diffusion transformer for real-time motor generation. Trained on a heterogeneous mix of real-robot trajectories, human videos, and synthetic data. Fully open-sourced on GitHub and HuggingFace.',
    url: 'https://arxiv.org/abs/2503.14734',
    keyFinding: 'Outperforms SoTA imitation learning baselines and transfers zero-shot to real Fourier GR-1 for language-conditioned bimanual manipulation.',
    category: 'VLA Models',
  },
  {
    id: 'twist-2025',
    title: 'TWIST: Teleoperated Whole-Body Imitation System',
    authors: ['Yanjie Ze', 'Zixuan Chen', 'João Pedro Araújo', 'Zi-ang Cao', 'Xue Bin Peng', 'Jiajun Wu', 'C. Karen Liu'],
    institution: 'Stanford University / Simon Fraser University',
    date: '2025-05-05',
    summary: 'TWIST retargets human motion capture data to a humanoid robot to generate reference clips, then trains a single unified whole-body controller combining RL and behavior cloning. The controller handles whole-body manipulation, legged manipulation, locomotion, and expressive movement with one network. Fully open-sourced including datasets, training code, and checkpoints.',
    url: 'https://arxiv.org/abs/2505.02833',
    keyFinding: 'A single unified controller achieves unprecedented coordinated whole-body motor skills spanning both locomotion and manipulation without task-specific controllers.',
    category: 'Manipulation',
  },
  {
    id: 'sim2real-dex-humanoid-2025',
    title: 'Sim-to-Real Reinforcement Learning for Vision-Based Dexterous Manipulation on Humanoids',
    authors: ['Toru Lin', 'Kartik Sachdev', 'Linxi Fan', 'Jitendra Malik', 'Yuke Zhu'],
    institution: 'UC Berkeley / NVIDIA / UT Austin',
    date: '2025-02-27',
    summary: 'A practical sim-to-real RL recipe for training vision-based dexterous manipulation on humanoids with multi-fingered hands — without relying on human demonstrations. Components include automated real-to-sim tuning, contact-based reward formulation, divide-and-conquer policy distillation, and modality-specific augmentation to close the perceptual sim-to-real gap.',
    url: 'https://arxiv.org/abs/2502.20396',
    keyFinding: 'First successful sim-to-real RL transfer of vision-based dexterous manipulation to a humanoid with multi-fingered hands, achieving high success on unseen objects. Published at CoRL 2025.',
    category: 'Sim-to-Real',
  },
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
]

const FILTER_CATEGORIES = [
  'All',
  'VLA Models',
  'Locomotion',
  'Manipulation',
  'Sim-to-Real',
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
