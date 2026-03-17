---
title: "New Planning Method Tackles Humanoid Non-Prehensile Tasks"
slug: "ldhp-hierarchical-planning-non-prehensile-manipulation"
date: "2026-03-17T13:21:58.604Z"
updated: "2026-03-17T13:21:58.604Z"
category: "research"
tags: ["manipulation", "planning", "dexterous-hands", "research"]
companies: []
robots: []
excerpt: "LDHP framework addresses critical gap in humanoid manipulation of thin, large objects that can't be grasped traditionally"
featured: false
sources:
  - title: "LDHP: Library-Driven Hierarchical Planning for Non-prehensile Dexterous Manipulation"
    url: "https://arxiv.org/abs/2603.13844"
---
# How Can Humanoids Handle Objects They Can't Grasp?

A new hierarchical planning framework called LDHP (Library-Driven Hierarchical Planning) addresses one of humanoid robotics' most persistent challenges: manipulating objects that cannot be traditionally grasped. The research, published on arXiv, tackles the manipulation of thin, large, or otherwise ungraspable objects—a critical capability gap that has limited humanoid deployment in unstructured environments.

Non-prehensile manipulation represents a fundamental bottleneck for humanoid systems attempting real-world tasks. While current approaches either rely on manual design heuristics that generate physically unrealizable motions or require massive training datasets that fail to generalize, LDHP introduces a library-driven approach that bridges this gap. The framework specifically addresses gripper property constraints that previous planning methods have ignored, potentially unlocking new manipulation capabilities for humanoid platforms from Figure AI, Tesla Optimus, and Honda's ASIMO successors.

This development comes as the industry grapples with the sim-to-real transfer problem for complex manipulation tasks. With humanoid companies raising over $2.3 billion in 2023 alone, solving non-prehensile manipulation could significantly expand addressable use cases across manufacturing, logistics, and domestic applications.

## The Non-Prehensile Manipulation Challenge

Non-prehensile manipulation encompasses techniques like pushing, sliding, pivoting, and toppling objects rather than grasping them directly. This capability becomes essential when humanoids encounter thin sheets, large panels, fragile items, or objects positioned in constrained spaces where traditional end-effector approaches fail.

Current humanoid hands, whether they use tendon-driven systems like those in Agility's Digit or direct-drive approaches in Figure-02, struggle with these tasks due to planning limitations rather than hardware constraints. The fundamental issue lies in motion planning algorithms that assume prehensile contact models and fail to account for the complex dynamics of non-prehensile interactions.

Existing search-based methods often generate trajectories that violate physical constraints or require gripper configurations beyond the robot's kinematic limits. Meanwhile, learning-based approaches demand extensive training data for each object type and manipulation scenario, making them impractical for the diverse, unstructured environments where humanoids must operate.

## LDHP's Hierarchical Architecture

The LDHP framework introduces a two-level hierarchical structure that separates high-level task planning from low-level motion execution. At the top level, a symbolic planner reasons about manipulation primitives and their sequencing, while the bottom level handles the geometric and dynamic constraints specific to each primitive.

The "library-driven" aspect refers to a curated collection of manipulation primitives—fundamental non-prehensile actions that can be composed into more complex behaviors. Each primitive in the library includes explicit models of gripper constraints, contact dynamics, and feasibility conditions that previous approaches often ignored.

This architecture enables the system to generate physically realizable motion plans while maintaining the flexibility to handle novel object configurations. The hierarchical decomposition also supports better computational scaling, as high-level planning can focus on task sequencing while delegating detailed trajectory optimization to specialized modules.

## Industry Implications for Humanoid Development

The LDHP framework directly addresses manipulation bottlenecks that have constrained humanoid deployment scenarios. Current humanoid platforms excel at locomotion and basic manipulation but struggle with the diverse object handling required in real-world applications.

For humanoid manufacturers, this research suggests a path toward expanding operational capabilities without requiring new hardware. Companies like Boston Dynamics, with their Atlas platform, and Apptronik with Apollo could potentially integrate LDHP-style planning to enhance manipulation versatility.

The framework's emphasis on library-driven primitives also aligns with industry trends toward modular AI architectures. Rather than training monolithic models for each manipulation task, the approach enables systematic accumulation of manipulation capabilities that can be composed for novel scenarios.

## Technical Validation and Limitations

While the arXiv paper presents the theoretical framework, several critical questions remain regarding practical implementation. The research does not specify computational requirements for real-time planning, which remains crucial for humanoid applications where manipulation decisions must occur within hundreds of milliseconds.

The library-driven approach also raises questions about primitive discovery and curation. How systems will automatically identify and validate new manipulation primitives remains unclear, potentially limiting adaptability to truly novel manipulation challenges.

Additionally, the framework's reliance on accurate contact modeling may struggle with the sensor noise and calibration drift common in real-world humanoid deployments. The gap between idealized planning models and messy reality continues to challenge practical manipulation systems.

## Key Takeaways

- LDHP introduces a hierarchical planning framework specifically designed for non-prehensile manipulation tasks that humanoids commonly encounter
- The library-driven approach enables composition of manipulation primitives while respecting physical gripper constraints
- The framework addresses a critical capability gap that has limited humanoid deployment in unstructured environments
- Implementation questions remain regarding computational requirements and primitive discovery mechanisms
- The research suggests a path toward expanding humanoid manipulation capabilities without new hardware requirements

## Frequently Asked Questions

**What types of objects can LDHP help humanoids manipulate?**
LDHP targets thin, large, or fragile objects that cannot be traditionally grasped, such as sheets of material, panels, or items in constrained spaces where conventional end-effector approaches fail.

**How does LDHP differ from existing manipulation planning methods?**
Unlike current approaches that either rely on manual design heuristics or require massive training datasets, LDHP uses a library of validated manipulation primitives that can be hierarchically composed while respecting physical constraints.

**What humanoid platforms could benefit from LDHP integration?**
Any humanoid system with dexterous manipulation capabilities could potentially integrate LDHP-style planning, including platforms from Figure AI, Tesla, Boston Dynamics, and other major manufacturers.

**Does LDHP require new hardware or sensors for humanoid robots?**
The framework appears to work with existing humanoid hardware configurations, focusing on planning improvements rather than requiring new actuators or sensors.

**What are the main limitations of the LDHP approach?**
Key limitations include unspecified computational requirements, questions about automatic primitive discovery, and potential challenges with real-world sensor noise and calibration issues.