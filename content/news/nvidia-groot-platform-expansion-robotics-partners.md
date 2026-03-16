---
title: "NVIDIA Expands GR00T Platform with New Robotics Partners"
slug: "nvidia-groot-platform-expansion-robotics-partners"
date: "2026-03-16T21:05:10.647Z"
updated: "2026-03-16T21:05:10.647Z"
category: "breaking"
tags: ["nvidia", "groot", "physical-ai", "partnerships"]
companies: ["NVIDIA"]
robots: ["gr00t"]
excerpt: "NVIDIA announces major expansion of GR00T platform with global robotics companies pushing humanoid deployment forward"
featured: false
sources:
  - title: "NVIDIA and Global Robotics Leaders Take Physical AI to the Real World"
    url: "https://news.google.com/rss/articles/CBMipwFBVV95cUxNU0llRll3YzhxMzU3TWR3Ukc5NmFpS3NuaGlGcURrRlJZSkh1eEtISWtIcjhEbEVfaV91RF9vNWZUTXduRnB0Vm9CSmV2TkdSN2tDTHZKRDVFVkwycHJuNWFoMGdFZ0c1MHhVWjhkTXZWOWFRVXhwUmRaZTZEWlBkZnBIal84aThKbDRTY2M4cElfelJVeDN2UC1NMFd5R2l6RjhtQ01OQQ?oc=5"
---
NVIDIA has announced a significant expansion of its GR00T (Generalist Robot 00 Technology) platform, partnering with multiple robotics companies to accelerate physical AI deployment in real-world applications. The announcement signals NVIDIA's deepening commitment to the humanoid robotics ecosystem, providing both hardware acceleration and foundational AI models specifically designed for embodied intelligence. This expansion represents a critical inflection point for the industry, as major chip manufacturers pivot from pure compute providers to full-stack robotics enablers.

The GR00T platform, built on NVIDIA's Jetson Thor robotics computer, offers whole-body control capabilities and multimodal foundation models that can process vision, language, and action data simultaneously. Early partners reportedly include several undisclosed humanoid robotics companies working on manufacturing and service applications. NVIDIA's approach focuses on sim-to-real transfer learning, allowing robots to train in simulation environments powered by Omniverse before deployment in physical settings.

## What Makes GR00T Different from Generic AI Models?

GR00T distinguishes itself through its embodied AI architecture, specifically designed for physical manipulation and navigation tasks that generic large language models cannot handle. Unlike ChatGPT or similar systems, GR00T processes sensor fusion data from cameras, IMUs, and force sensors to generate real-time motor commands for humanoid robots.

The platform leverages NVIDIA's Isaac Sim environment for training, where robots can accumulate millions of hours of experience in simulated factories, warehouses, and homes before touching real hardware. This sim-to-real pipeline addresses the data scarcity problem that has historically limited humanoid robot capabilities — physical robots can only train for limited hours due to wear, safety concerns, and supervision requirements.

NVIDIA claims GR00T models demonstrate zero-shot generalization across different robot morphologies, meaning a model trained on one humanoid design can potentially transfer to another with minimal fine-tuning. This capability could dramatically reduce development timelines for new humanoid platforms.

## Industry Impact and Competitive Positioning

This announcement positions NVIDIA as a direct competitor to companies like Physical Intelligence and Skild AI, which are building their own foundation models for robotics. However, NVIDIA's advantage lies in its integrated hardware-software approach — GR00T models are optimized for Jetson Thor's architecture, potentially delivering superior inference performance compared to generic cloud-based solutions.

The timing aligns with increasing humanoid robot deployments across manufacturing and logistics. Companies like Figure AI, 1X Technologies, and Agility Robotics have been scaling production, but all face the common challenge of reliable manipulation in unstructured environments. GR00T's multimodal approach could address current limitations in dexterous manipulation and dynamic obstacle avoidance.

For robotics startups, this creates both opportunity and concern. Access to NVIDIA's compute infrastructure and pre-trained models could accelerate development cycles, but dependence on a single vendor's platform raises questions about long-term strategic control and differentiation.

## Technical Architecture and Performance Metrics

GR00T operates on NVIDIA's transformer-based architecture, processing up to 13 camera streams simultaneously while maintaining real-time control loops at 1kHz for critical safety systems. The platform supports both centralized cloud training and edge inference, enabling continuous learning from deployed robot fleets.

Key technical specifications include support for robots with up to 50 degrees of freedom, force-torque sensing integration, and compatibility with both electric and hydraulic actuator systems. NVIDIA has not disclosed specific benchmark performance data, but early demonstrations suggest significant improvements in task completion rates for complex manipulation sequences.

The platform's backdrivable control algorithms enable safe human-robot interaction, a critical requirement for service robot applications in retail and hospitality environments.

## Key Takeaways

- NVIDIA's GR00T platform expansion signals serious commitment to humanoid robotics beyond just providing compute hardware
- Integrated sim-to-real training pipeline addresses the data bottleneck that has limited humanoid robot capabilities
- Zero-shot generalization across robot morphologies could accelerate industry-wide adoption and reduce development costs
- Competition intensifies with Physical Intelligence and other foundation model companies in the robotics space
- Hardware-software integration may provide NVIDIA with performance advantages over cloud-only solutions

## Frequently Asked Questions

**How does GR00T compare to OpenAI's robotics efforts?**
While OpenAI has demonstrated impressive robotics capabilities, GR00T is specifically designed as a production platform for commercial humanoid deployment. NVIDIA's integrated hardware approach and real-time inference capabilities target manufacturing and service applications rather than research demonstrations.

**What robotics companies are confirmed GR00T partners?**
NVIDIA has not disclosed specific partner names in this announcement, though the company has previously worked with Figure AI, Boston Dynamics, and several Chinese humanoid robotics manufacturers on various projects.

**Can existing humanoid robots integrate GR00T without hardware changes?**
Integration depends on computational requirements and sensor compatibility. Robots would likely need NVIDIA's Jetson Thor compute module, but existing actuators and sensors can potentially interface with the platform through standard protocols.

**What are the licensing costs for GR00T platform access?**
NVIDIA has not announced pricing details, though the company typically uses per-unit licensing models for embedded AI platforms. Expect costs to vary based on deployment volume and support requirements.

**How does GR00T handle safety-critical applications?**
The platform includes redundant control systems and real-time monitoring for safety-critical functions. However, regulatory approval for specific applications like healthcare or autonomous operation will require additional validation beyond NVIDIA's platform capabilities.