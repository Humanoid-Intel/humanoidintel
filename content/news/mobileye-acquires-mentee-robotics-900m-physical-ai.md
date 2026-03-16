---
title: "Mobileye Acquires Mentee Robotics for $900M"
slug: "mobileye-acquires-mentee-robotics-900m-physical-ai"
date: "2026-01-06T21:00:00Z"
updated: "2026-03-16T20:00:00Z"
category: "market"
tags: ["mobileye", "mentee-robotics", "acquisition", "physical-ai", "funding", "ces-2026"]
companies: ["Mobileye", "Mentee Robotics", "Intel"]
robots: ["MenteeBot"]
excerpt: "Mobileye pays $900M for Israeli humanoid startup Mentee Robotics, combining EyeQ perception silicon with a simulation-first humanoid AI stack."
featured: true
sources:
  - title: "Mobileye To Acquire Mentee Robotics to Accelerate Physical AI Leadership"
    url: "https://www.mobileye.com/news/mobileye-to-acquire-mentee-robotics-to-accelerate-physical-ai-leadership/"
  - title: "Mobileye acquires humanoid robot startup Mentee Robotics for $900M"
    url: "https://techcrunch.com/2026/01/06/mobileye-acquires-humanoid-robot-startup-mentee-robotics-for-900m/"
  - title: "Mobileye to Buy Humanoid Robot Maker Mentee for $900 Million"
    url: "https://www.bloomberg.com/news/articles/2026-01-06/mobileye-to-buy-humanoid-robot-maker-mentee-for-900-million"
---

Mobileye, Intel's publicly traded autonomous driving subsidiary, announced at CES 2026 on January 6 that it is acquiring Israeli humanoid robotics startup Mentee Robotics for $900 million — $612 million in cash plus approximately 26.2 million shares of Mobileye Class A stock. The deal, which closed in Q1 2026, is one of the largest acquisitions in humanoid robotics history and the clearest signal yet that the race to own the full physical AI stack is intensifying well beyond the traditional robotics players.

## Why This Deal Is Different

Most humanoid robotics M&A has followed a hardware logic: bigger company acquires a team with a working prototype. The Mobileye-Mentee deal inverts that. Mobileye is not a robotics company. It is the world's dominant supplier of ADAS (Advanced Driver Assistance Systems) chips, with its EyeQ silicon deployed in more than 160 million vehicles globally. By acquiring Mentee, Mobileye is making a vertical integration bet: own both the perception layer (EyeQ) and the AI control stack, then deploy them together in humanoid robots the same way EyeQ is deployed in cars.

Prof. Amnon Shashua, Mobileye's co-founder and Intel EVP who chairs Mentee's board, calls this "Mobileye 3.0." Version 1.0 was camera-based ADAS. Version 2.0 was full autonomous driving. Version 3.0 is physical AI across both cars and robots — a platform strategy that treats perception, reasoning, and actuation as one continuous engineering problem regardless of the body it runs in.

## What Mentee Built

Founded in 2021, Mentee Robotics built a third-generation humanoid platform distinguished by its training methodology. Where most humanoid AI companies rely on large-scale teleoperation data — thousands of hours of humans physically operating robots — Mentee uses what it calls human-to-robot mentoring: a single human demonstration is recorded and algorithmically converted into millions of synthetic training trajectories inside simulation. The result is a data-efficient learning approach that sidesteps the expensive, slow bottleneck of real-world data collection.

The underlying AI architecture combines vision-language-action (VLA) models with simulation-first training, a similar paradigm to Nvidia's Isaac GR00T and Physical Intelligence's π0, but developed entirely in-house at a fraction of the cost. Mentee's third-generation robot features in-house hardware and software design — actuators, perception stack, and control policy developed as a single integrated system rather than assembled from off-the-shelf components.

## The Strategic Logic

The combination creates a direct competitor to Nvidia's humanoid platform stack. Nvidia's play is Isaac (simulation) + GR00T (foundation model) + Jetson Thor (edge inference chip). Mobileye's emerging answer is: Mentee's simulation-first training + Mentee's VLA model + EyeQ (perception and inference silicon). Both are hardware-agnostic software platforms that humanoid manufacturers can license — but Mobileye has a manufacturing scale and chip supply relationship with automotive OEMs that Nvidia is still building.

It also creates a unique cross-pollination opportunity. Mentee's simulation-based training could improve Mobileye's handling of rare driving scenarios — the long-tail edge cases that still challenge autonomous vehicles. Mobileye's decades of production validation infrastructure and customer relationships with BMW, Volkswagen, and Toyota could fast-track Mentee's commercialization timeline in ways a standalone startup could not.

## Go-to-Market Roadmap

Mobileye outlined a phased commercialization plan for MenteeBot:

- **2026:** Proof-of-concept deployments with enterprise customers in fulfillment centers and structured assembly environments
- **2027:** First experimental production batch manufactured for pre-commercial validation
- **2028:** Commercial deployment at scale in structured industrial environments
- **~2030:** Expansion to unstructured home environments with continuous learning capabilities

The 2026–2028 industrial focus mirrors the strategy of Figure AI (BMW deployment), Agility Robotics (Amazon partnership), and Apptronik (GXO Logistics) — all of which are targeting the same structured factory and warehouse settings where robots can operate with predictable task constraints before tackling the harder problem of general-purpose household use.

## Deal Governance

The acquisition received board approval following review by a special committee of independent Mobileye directors — a process required because Prof. Shashua is both Mobileye's co-founder and a significant shareholder of Mentee. He recused himself from the board vote. Intel, as Mobileye's majority Class B shareholder, also approved the transaction. Mentee will operate as an independent unit within Mobileye, preserving its engineering culture while accessing Mobileye's AI training infrastructure and global customer network.

## Industry Implications

The Mentee acquisition accelerates a consolidation trend that has been building since 2024. The question in humanoid robotics is no longer whether humanoids will be commercially deployed — it is who owns the infrastructure layer that all humanoids run on. Nvidia has the most momentum with GR00T. Physical Intelligence and Skild AI are competing for the model licensing market. And now Mobileye, with $900M and a 160-million-unit installed base of perception silicon, is entering the arena with a different angle: automotive-grade production scale.

For investors tracking the space, the deal sets a new benchmark for humanoid AI acquisition prices. Mentee was founded in 2021 and raised limited outside capital before the acquisition — suggesting the $900M price reflects primarily the technology and team rather than a proven revenue base. That valuation multiple will recalibrate how early-stage humanoid AI companies are priced in future rounds.

## Key Takeaways

- Mobileye acquires Mentee Robotics for **$900M** ($612M cash + shares), announced CES 2026
- Mentee's core technology: **simulation-first training** that converts one human demo into millions of synthetic trajectories
- Strategic thesis: combine **EyeQ perception silicon** + Mentee's **VLA control model** into a full humanoid platform stack
- Direct competitive response to **Nvidia's Isaac/GR00T/Jetson Thor** ecosystem
- Commercial roadmap: industrial PoCs in 2026, production batch 2027, commercial scale 2028, home use ~2030
- Mentee operates as **independent unit** within Mobileye

## Frequently Asked Questions

**What is Mentee Robotics?**
Mentee Robotics is an Israeli humanoid robotics startup founded in 2021, co-founded by Prof. Amnon Shashua. It built a full-body humanoid robot platform using simulation-first AI training that converts single human demonstrations into millions of synthetic training examples.

**Why did Mobileye acquire a humanoid robotics company?**
Mobileye is extending its core competency — perception AI for physical systems — from autonomous vehicles to humanoid robots. The acquisition gives Mobileye a complete physical AI stack: perception chips (EyeQ) plus a humanoid AI control platform (Mentee), enabling it to compete with Nvidia's Isaac/GR00T robotics platform.

**How does Mentee's training approach differ from competitors?**
Rather than requiring large-scale teleoperation data collection (thousands of hours of humans operating robots), Mentee uses "human-to-robot mentoring" — a single human demonstration is algorithmically amplified into millions of simulated training trajectories. This makes training faster and cheaper than data-intensive approaches used by most competitors.

**When will MenteeBot be commercially available?**
Mobileye's roadmap targets proof-of-concept industrial deployments in 2026, a first production batch in 2027, commercial-scale deployment in structured environments in 2028, and home/unstructured environments around 2030.

**Is this the largest acquisition in humanoid robotics?**
At $900M, it is one of the largest. The Hyundai acquisition of Boston Dynamics in 2021 was valued at approximately $1.1B. The Mobileye-Mentee deal is notable as the largest acquisition of a pure-play humanoid AI company (as opposed to a hardware manufacturer).
