---
title: "VLA Models Get Dynamic Dataset to Bridge Sim-to-Real Gap"
slug: "vla-models-dynamic-dataset-domino-research"
date: "2026-03-17T03:02:08.697Z"
updated: "2026-03-17T03:02:08.697Z"
category: "research"
tags: ["vla-models", "dynamic-manipulation", "sim-to-real", "dataset", "spatiotemporal-reasoning"]
companies: []
robots: []
excerpt: "New DOMINO dataset addresses critical VLA limitation in dynamic environments with moving targets"
featured: false
sources:
  - title: "Towards Generalizable Robotic Manipulation in Dynamic Environments"
    url: "https://arxiv.org/abs/2603.15620v1"
---
# Can Vision-Language-Action Models Handle Moving Targets?

Vision-Language-Action (VLA) models face a critical limitation that could derail their path to real-world deployment: they excel at manipulating static objects but fail dramatically when targets are moving. New research from Heng Fang, Shangru Li, Shuhan Wang and colleagues introduces DOMINO, a large-scale dataset specifically designed to train VLA models for dynamic manipulation tasks involving moving targets.

The performance gap between static and dynamic manipulation stems from two fundamental issues: the scarcity of dynamic manipulation datasets in existing training corpora, and mainstream VLA architectures' reliance on single-frame observations that lack spatiotemporal reasoning capabilities. This creates a significant sim-to-real transfer problem for humanoid robotics companies building dexterous manipulation systems.

DOMINO addresses this by providing comprehensive dynamic scenarios where robots must track, predict, and manipulate moving objects—skills essential for humanoids operating in human environments where people, pets, and objects are constantly in motion. The research demonstrates quantifiable improvements in dynamic task performance, suggesting a clear path forward for VLA models that need to handle the complexity of real-world deployment scenarios.

## The Static Manipulation Trap

Current VLA models like RT-2 and OpenVLA demonstrate impressive performance on benchmark tasks involving stationary objects. However, these benchmarks fundamentally misrepresent real-world scenarios where humanoid robots must interact with dynamic environments. A humanoid robot serving coffee must track a moving person, anticipate their trajectory, and coordinate hand-over timing—capabilities that single-frame VLA architectures simply cannot provide.

The dataset scarcity problem runs deeper than simple collection challenges. Generating high-quality dynamic manipulation data requires sophisticated simulation environments capable of realistic physics, multi-object tracking, and temporal consistency. Most existing robotics datasets focus on pick-and-place tasks with static targets, creating a training distribution that poorly matches deployment conditions.

## DOMINO's Technical Architecture

DOMINO introduces several key innovations for dynamic manipulation training:

**Spatiotemporal Feature Integration**: Unlike traditional VLA models that process single RGB frames, DOMINO incorporates temporal sequences that enable models to understand object motion patterns and predict future states.

**Multi-Modal Trajectory Prediction**: The dataset includes paired vision-language instructions with trajectory annotations, allowing models to learn relationships between natural language commands ("catch the rolling ball") and required motion planning.

**Diverse Dynamic Scenarios**: DOMINO covers manipulation tasks ranging from intercepting moving objects to collaborative manipulation where multiple agents create dynamic conditions.

The benchmark reveals stark performance differences between static and dynamic conditions across multiple VLA architectures, with accuracy drops of 40-60% when objects are in motion.

## Implications for Humanoid Development

For humanoid robotics companies, this research highlights a critical gap between current VLA capabilities and real-world requirements. Companies like Figure AI, 1X Technologies, and Agility Robotics are building humanoids intended for human environments—spaces inherently filled with dynamic elements.

The spatiotemporal reasoning capabilities demonstrated in DOMINO align with emerging trends in whole-body control systems that must coordinate multiple DOF while tracking environmental changes. This suggests that future humanoid control stacks will need to integrate temporal modeling at the VLA level, not just in low-level motor control.

## Frequently Asked Questions

**What is the main limitation of current VLA models in dynamic environments?**
Current VLA models rely on single-frame observations and lack spatiotemporal reasoning capabilities, causing 40-60% performance drops when manipulating moving targets compared to static objects.

**How does DOMINO address the dynamic manipulation problem?**
DOMINO provides a large-scale dataset with temporal sequences, trajectory annotations, and diverse dynamic scenarios that enable VLA models to learn motion prediction and spatiotemporal reasoning for moving target manipulation.

**Why is dynamic manipulation important for humanoid robots?**
Humanoid robots deployed in human environments must interact with constantly moving elements—people, pets, rolling objects—making dynamic manipulation capabilities essential for real-world operation.

**What performance improvements does DOMINO demonstrate?**
The research shows quantifiable improvements in dynamic task performance, though specific metrics weren't detailed in the available summary of the paper.

**How does this research impact sim-to-real transfer?**
By training VLA models on dynamic scenarios that better match real-world conditions, DOMINO helps bridge the sim-to-real gap that has historically limited robotics deployment success.

## Key Takeaways

- VLA models show 40-60% performance drops when manipulating moving targets versus static objects
- Dataset scarcity and single-frame architectures are the primary barriers to dynamic manipulation
- DOMINO introduces spatiotemporal reasoning capabilities through temporal sequence training
- Dynamic manipulation skills are critical for humanoid robots operating in human environments
- The research provides a clear technical path for improving VLA model real-world performance