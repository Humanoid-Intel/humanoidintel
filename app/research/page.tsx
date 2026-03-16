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
  // ── 2026 papers ────────────────────────────────────────────────────────────
  {
    id: 'psi0-2026',
    title: 'Ψ₀: An Open Foundation Model Towards Universal Humanoid Loco-Manipulation',
    authors: ['Songlin Wei', 'Hongyi Jing', 'Boqian Li', 'Zhenyu Zhao', 'Jiageng Mao', 'Zhenhao Ni', 'Yue Wang'],
    institution: 'University of Southern California / Shanghai AI Lab',
    date: '2026-03-12',
    summary: 'A staged training approach that sidesteps the pitfalls of directly mixing human and robot data. Ψ₀ first pre-trains on 800 hours of egocentric human manipulation video, then post-trains a flow-based action expert on just 30 hours of humanoid robot data. The complete ecosystem — training pipelines, model weights, and inference engines — is fully open-sourced.',
    url: 'https://arxiv.org/abs/2603.12263',
    keyFinding: 'Outperforms baselines trained on 10× more data by >40% task success rate. Staged human-to-robot transfer is dramatically more data-efficient than joint training.',
    category: 'VLA Models',
  },
  {
    id: 'humdex-2026',
    title: 'HumDex: Humanoid Dexterous Manipulation Made Easy',
    authors: ['Liang Heng', 'Yihe Tang', 'Jiajun Xu', 'Henghui Bao', 'Di Huang', 'Yue Wang'],
    institution: 'University of Southern California',
    date: '2026-03-12',
    summary: 'A portable teleoperation framework for dexterous humanoid manipulation using IMU-based motion tracking. Introduces a learning-based hand control retargeting method and a two-phase training approach: pre-training on human motion data then fine-tuning on robot data to bridge the embodiment gap. Full system is open-sourced.',
    url: 'https://arxiv.org/abs/2603.12260',
    keyFinding: 'Achieves improved generalization to new object configurations with minimal data collection, reducing hardware cost and complexity for dexterous manipulation data pipelines.',
    category: 'Manipulation',
  },
  {
    id: 'zerowbc-2026',
    title: 'ZeroWBC: Learning Natural Visuomotor Humanoid Control Directly from Human Egocentric Video',
    authors: ['Haoran Yang', 'Jiacheng Bao', 'Yucheng Xin', 'Haoming Song', 'Yuyang Tian', 'Bin Zhao', 'Dong Wang'],
    institution: 'Shanghai AI Lab / Northwestern Polytechnical University',
    date: '2026-03-10',
    summary: 'ZeroWBC eliminates the need for robot teleoperation data by fine-tuning a Vision-Language Model to predict human motions from egocentric video and text instructions. A tracking policy adapts predicted motions to the robot\'s joints for whole-body control. Tested on the Unitree G1 humanoid across diverse motion categories including sitting and kicking.',
    url: 'https://arxiv.org/abs/2603.09170',
    keyFinding: 'Achieves natural whole-body visuomotor control with broader behavioral versatility than prior methods — without any robot-collected demonstrations.',
    category: 'VLA Models',
  },
  {
    id: 'physiflow-2026',
    title: 'PhysiFlow: Physics-Aware Humanoid Whole-Body VLA via Multi-Brain Latent Flow Matching',
    authors: ['Weikai Qin', 'Sichen Wu', 'Ci Chen', 'Mengfan Liu', 'Linxi Feng', 'Xinru Cui', 'Hesheng Wang'],
    institution: 'Shanghai Jiao Tong University',
    date: '2026-03-05',
    summary: 'PhysiFlow proposes a "multi-brain" VLA framework that combines semantic understanding with physics-aware whole-body coordination. It uses latent flow matching to bridge high-level vision-language intent with low-level motor execution, improving inference efficiency while maintaining physical plausibility for full-body humanoid coordination.',
    url: 'https://arxiv.org/abs/2603.05410',
    keyFinding: 'Multi-brain latent flow matching outperforms single-branch VLA baselines on whole-body manipulation benchmarks with improved physical consistency.',
    category: 'VLA Models',
  },
  {
    id: 'ultra-2026',
    title: 'ULTRA: Unified Multimodal Control for Autonomous Humanoid Whole-Body Loco-Manipulation',
    authors: ['Xialin He', 'Sirui Xu', 'Xinyao Li', 'Runpei Dong', 'Liang-Yan Gui'],
    institution: 'University of Illinois Urbana-Champaign',
    date: '2026-03-03',
    summary: 'ULTRA presents a unified multimodal controller for humanoid whole-body loco-manipulation handling varied inputs — from motion-capture data to imperfect egocentric vision. A physics-driven neural retargeting algorithm compresses skills into latent representations, enabling autonomous goal-directed execution without reference motions at test time. Evaluated on Unitree G1.',
    url: 'https://arxiv.org/abs/2603.03279',
    keyFinding: 'Outperforms tracking-only baselines in autonomous whole-body manipulation and demonstrates robust execution across input modality variations.',
    category: 'Locomotion',
  },
  {
    id: 'spark-2026',
    title: 'SPARK: Skeleton-Parameter Aligned Retargeting on Humanoid Robots with Kinodynamic Trajectory Optimization',
    authors: ['Hanwen Wang', 'Qiayuan Liao', 'Bike Zhang', 'Kunzhao Ren', 'Koushil Sreenath', 'Xiaobin Xiong'],
    institution: 'UC Berkeley',
    date: '2026-03-11',
    summary: 'A two-stage pipeline (accepted ICRA 2026) for converting human motion-capture data into physically feasible humanoid reference trajectories. Human motion is first aligned to the target robot\'s skeletal parameters, then three-stage kinodynamic trajectory optimization produces dynamically consistent motion references that generalize across different humanoid platforms.',
    url: 'https://arxiv.org/abs/2603.11480',
    keyFinding: 'Generalizes across multiple humanoid platforms and enables RL policies to train on physically consistent MoCap-derived references without per-robot manual tuning.',
    category: 'Sim-to-Real',
  },
  {
    id: 'humi-2026',
    title: 'HuMI: Humanoid Whole-Body Manipulation from Robot-Free Demonstrations',
    authors: ['Ruiqian Nai', 'Boyuan Zheng', 'Junming Zhao', 'Haodong Zhu', 'Sicong Dai'],
    institution: 'Peking University / Beijing Institute of General Artificial Intelligence',
    date: '2026-02-06',
    summary: 'HuMI enables learning diverse humanoid whole-body manipulation tasks without any physical robot during data collection. A portable wearable captures full-body human motion, feeding a hierarchical learning pipeline that translates human motions into dexterous humanoid skills. Tested across five tasks: kneeling, squatting, tossing, walking, and bimanual manipulation.',
    url: 'https://arxiv.org/abs/2602.06643',
    keyFinding: '3× data collection efficiency vs. teleoperation and 70% success in unseen environments, demonstrating strong sim-to-real generalization.',
    category: 'Manipulation',
  },
  {
    id: 'rpl-2026',
    title: 'RPL: Learning Robust Humanoid Perceptive Locomotion on Challenging Terrains',
    authors: ['Yuanhang Zhang', 'Younggyo Seo', 'Juyue Chen', 'Yifu Yuan', 'Koushil Sreenath'],
    institution: 'UC Berkeley',
    date: '2026-02-03',
    summary: 'A two-stage training framework for multi-directional humanoid locomotion on complex terrain. Stage one trains terrain-specific expert policies using privileged height map observations; stage two distills these into a single transformer policy driven by multiple depth cameras. A custom simulation tool achieves 5× faster depth rendering than prior alternatives.',
    url: 'https://arxiv.org/abs/2602.03002',
    keyFinding: 'Deployed on real hardware carrying 2 kg payloads, successfully traversing 20° slopes, variable-step staircases, and stepping stones separated by 60 cm gaps.',
    category: 'Locomotion',
  },
  {
    id: 'uniforce-2026',
    title: 'UniForce: A Unified Latent Force Model for Robot Manipulation with Diverse Tactile Sensors',
    authors: ['Zhuo Chen', 'Fei Ni', 'Kaiyao Luo', 'Zhiyuan Wu', 'Nathan F. Lepora', 'Shan Luo'],
    institution: "King's College London / University of Bristol",
    date: '2026-02-01',
    summary: 'UniForce addresses the tactile sensor heterogeneity problem by learning a shared latent force representation across diverse sensor types (GelSight, TacTip, uSkin). It jointly models inverse and forward dynamics, constrained by force equilibrium and image reconstruction losses. The universal encoder enables zero-shot cross-sensor transfer for force-aware manipulation.',
    url: 'https://arxiv.org/abs/2602.01153',
    keyFinding: 'Consistent improvements in force estimation over prior methods across all three sensor types, with zero-shot transfer of manipulation policies between heterogeneous tactile sensors.',
    category: 'Tactile',
  },
  {
    id: 'demobot-2026',
    title: 'DemoBot: Efficient Learning of Bimanual Manipulation from a Single Human Video',
    authors: ['Yucheng Xu', 'Xiaofeng Mao', 'Elle Miller', 'Xinyu Yi', 'Yang Li'],
    institution: 'Beijing Institute of Technology / University of Edinburgh',
    date: '2026-01-04',
    summary: 'DemoBot enables a dual-arm, multi-finger robot to learn complex bimanual manipulation from a single unannotated RGB-D video demonstration. Structured motion trajectories are extracted from video, then a three-innovation RL pipeline — temporal-segment RL, success-gated reset, and event-driven reward curriculum — refines those motions through contact-rich simulation before real deployment.',
    url: 'https://arxiv.org/abs/2601.01651',
    keyFinding: 'Successfully tackles long-horizon bimanual assembly tasks from just one video demonstration, with the RL curriculum showing significantly better convergence than direct policy learning.',
    category: 'Manipulation',
  },
  // ── 2025 foundational papers ───────────────────────────────────────────────
  {
    id: 'xhugwbc-2026',
    title: 'Scalable and General Whole-Body Control for Cross-Humanoid Locomotion (XHugWBC)',
    authors: ['Yufei Xue', 'Yunfeng Lin', 'Wentao Dong', 'Yang Tang', 'Jingbo Wang', 'Jiangmiao Pang', 'Minghuan Liu'],
    institution: 'Shanghai AI Lab / Shanghai Jiao Tong University',
    date: '2026-02-05',
    summary: 'XHugWBC trains a single policy that generalizes whole-body locomotion and manipulation across diverse humanoid hardware without robot-specific retraining. Key innovations include physics-consistent morphological randomization and semantically aligned observation/action spaces. Validated across 12 simulated and 7 real-world humanoid platforms.',
    url: 'https://arxiv.org/abs/2602.05791',
    keyFinding: '100% zero-shot success rate across 7 real humanoid platforms despite large hardware variation. Accepted to ICML 2026.',
    category: 'Locomotion',
  },
  {
    id: 'wholebodyvla-2025',
    title: 'WholeBodyVLA: Towards Unified Latent VLA for Whole-Body Loco-Manipulation Control',
    authors: ['Haoran Jiang', 'Jin Chen', 'Qingwen Bu', 'Li Chen', 'Modi Shi'],
    institution: 'OpenDriveLab / Shanghai AI Lab / AgiBot',
    date: '2025-12-11',
    summary: 'A unified latent VLA framework for simultaneous locomotion and manipulation. The model learns from action-free egocentric video paired with a loco-manipulation RL policy, dramatically reducing training data cost. Validated on the AgiBot X2 humanoid on tasks requiring navigation + bimanual manipulation across large spaces. Accepted to ICLR 2026.',
    url: 'https://arxiv.org/abs/2512.11047',
    keyFinding: 'Outperforms prior baselines by 21.3%, demonstrating pushing loads >50 kg, bimanual grasping with navigation, and multi-step placement tasks autonomously in sequence.',
    category: 'VLA Models',
  },
  {
    id: 'twist-2025',
    title: 'TWIST: Teleoperated Whole-Body Imitation System',
    authors: ['Yanjie Ze', 'Zixuan Chen', 'João Pedro Araújo', 'Zi-ang Cao', 'Xue Bin Peng', 'Jiajun Wu', 'C. Karen Liu'],
    institution: 'Stanford University / Simon Fraser University',
    date: '2025-05-05',
    summary: 'TWIST retargets human motion-capture data to a humanoid to generate reference clips, then trains a single unified whole-body controller combining RL and behavior cloning. One network handles whole-body manipulation, legged manipulation, locomotion, and expressive movement. Fully open-sourced including datasets, training code, and checkpoints.',
    url: 'https://arxiv.org/abs/2505.02833',
    keyFinding: 'A single controller achieves unprecedented coordinated whole-body motor skills spanning locomotion and manipulation without task-specific sub-controllers.',
    category: 'Manipulation',
  },
  {
    id: 'groot-n1-2025',
    title: 'GR00T N1: An Open Foundation Model for Generalist Humanoid Robots',
    authors: ['Johan Bjorck', 'Fernando Castañeda', 'Nikita Cherniadev', 'Xingye Da', 'Linxi Fan'],
    institution: 'NVIDIA Research',
    date: '2025-03-18',
    summary: 'GR00T N1 is a 2.2B-parameter open foundation model built on a dual-system architecture — an Eagle-2 VLM for environmental understanding and a diffusion transformer for real-time motor generation. Trained on real-robot trajectories, human videos, and synthetic data. Fully open-sourced on GitHub and HuggingFace.',
    url: 'https://arxiv.org/abs/2503.14734',
    keyFinding: 'Outperforms SoTA imitation learning baselines and transfers zero-shot to real Fourier GR-1 for language-conditioned bimanual manipulation.',
    category: 'VLA Models',
  },
  {
    id: 'sim2real-dex-humanoid-2025',
    title: 'Sim-to-Real Reinforcement Learning for Vision-Based Dexterous Manipulation on Humanoids',
    authors: ['Toru Lin', 'Kartik Sachdev', 'Linxi Fan', 'Jitendra Malik', 'Yuke Zhu'],
    institution: 'UC Berkeley / NVIDIA / UT Austin',
    date: '2025-02-27',
    summary: 'A practical sim-to-real RL recipe for training vision-based dexterous manipulation on humanoids with multi-fingered hands without relying on demonstrations. Components include automated real-to-sim tuning, contact-based reward formulation, divide-and-conquer policy distillation, and modality-specific augmentation to close the perceptual sim-to-real gap.',
    url: 'https://arxiv.org/abs/2502.20396',
    keyFinding: 'First successful sim-to-real RL transfer of vision-based dexterous manipulation to a humanoid, achieving high success on unseen objects. Published at CoRL 2025.',
    category: 'Sim-to-Real',
  },
  {
    id: 'openvla-2024',
    title: 'OpenVLA: An Open-Source Vision-Language-Action Model',
    authors: ['Moo Jin Kim', 'Karl Pertsch', 'Siddharth Karamcheti', 'Ted Xiao', 'Chelsea Finn'],
    institution: 'Stanford University',
    date: '2024-06-13',
    summary: 'OpenVLA is a 7B-parameter open-source VLA model trained on 970k robot demonstrations, achieving state-of-the-art performance on manipulation benchmarks. The open weights and training code established a community baseline for vision-language-action research across diverse robot platforms.',
    url: 'https://arxiv.org/abs/2406.09246',
    keyFinding: '7B VLA models generalize to novel objects and environments with 16.5% improvement over prior SoTA, and the open-source release accelerated the entire VLA research community.',
    category: 'VLA Models',
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
