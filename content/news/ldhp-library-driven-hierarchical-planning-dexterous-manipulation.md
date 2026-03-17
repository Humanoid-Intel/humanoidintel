---
title: "New Planning Method Tackles Thin Object Manipulation"
slug: "ldhp-library-driven-hierarchical-planning-dexterous-manipulation"
date: "2026-03-17T04:04:53.409Z"
updated: "2026-03-17T04:04:53.409Z"
category: "research"
tags: ["dexterous-manipulation", "non-prehensile", "planning", "research"]
companies: []
robots: []
excerpt: "LDHP framework combines library-driven planning with hierarchical control for handling thin, ungraspable objects"
featured: false
sources:
  - title: "LDHP: Library-Driven Hierarchical Planning for Non-prehensile Dexterous Manipulation"
    url: "https://arxiv.org/abs/2603.13844"
---
# How Can Robots Handle Objects Too Thin to Grasp?

A new planning framework called LDHP (Library-Driven Hierarchical Planning) addresses one of robotics' most persistent challenges: manipulating thin, large, or otherwise ungraspable objects without traditional grasping. The research, published on arXiv, tackles the critical gap between sim-to-real transfer failures in non-prehensile manipulation and the data-intensive requirements of current learning approaches.

Non-prehensile manipulation—moving objects through pushing, sliding, or pivoting rather than grasping—remains essential for real-world robotics applications. Current planning methods often generate physically unrealizable motions by ignoring critical gripper geometry and contact dynamics, while training-based approaches require extensive datasets and struggle with zero-shot generalization to novel objects. The LDHP framework proposes a hierarchical approach that combines pre-computed motion libraries with real-time planning to bridge this gap.

The method represents a significant departure from both traditional search-based planners that rely on ad-hoc manual designs and end-to-end learning systems that demand massive training datasets. By incorporating gripper-specific constraints and contact physics directly into the planning process, LDHP aims to generate more physically realizable manipulation strategies for objects that conventional grasping cannot handle effectively.

## The Non-Prehensile Manipulation Challenge

Non-prehensile manipulation has emerged as a critical capability gap in humanoid robotics, particularly for household and industrial applications where objects vary dramatically in size, shape, and material properties. Unlike traditional pick-and-place operations, non-prehensile tasks require robots to reason about contact dynamics, surface friction, and multi-step motion sequences.

Current approaches fall into two broad categories, each with fundamental limitations. Search-based methods typically rely on simplified contact models and geometric primitives that fail to capture the nuanced physics of real-world interactions. These systems often generate trajectories that appear feasible in simulation but fail catastrophically when executed on physical hardware due to unmodeled contact dynamics or gripper constraints.

Learning-based approaches, while showing promise in controlled environments, face significant scalability challenges. Training effective policies for non-prehensile manipulation requires diverse datasets covering object geometries, surface materials, and environmental conditions. The resulting policies often exhibit poor generalization to objects or scenarios not represented in the training distribution, limiting their practical deployment.

## Library-Driven Hierarchical Planning Architecture

The LDHP framework introduces a two-level planning hierarchy that separates high-level task decomposition from low-level motion generation. At the higher level, the system maintains a library of pre-computed manipulation primitives, each encoding successful motion patterns for specific object-gripper interactions. These primitives capture both geometric and dynamic constraints, ensuring generated motions respect physical realizability requirements.

The lower planning level handles real-time adaptation and sequencing of these primitives for novel manipulation scenarios. By constraining the search space to physically validated motion patterns, the system avoids the computational overhead of exploring infeasible solutions while maintaining flexibility for novel task configurations.

This hierarchical decomposition addresses a key weakness in existing approaches: the disconnect between high-level planning abstractions and low-level execution constraints. Traditional planners often assume idealized contact models that ignore gripper geometry, leading to motion plans that cannot be executed reliably. LDHP's library-based approach ensures that all generated motions have been validated for specific gripper configurations and contact scenarios.

## Technical Implementation and Contact Modeling

The framework's technical foundation rests on improved contact modeling that explicitly accounts for gripper geometry and surface interactions. Unlike simplified point-contact models used in many planning systems, LDHP incorporates distributed contact patches and friction cone constraints that better represent real-world manipulation physics.

The motion primitive library is constructed through systematic exploration of the manipulation workspace, with each primitive validated through both simulation and physical testing. This validation process ensures that library entries represent genuinely executable motion patterns rather than theoretically optimal but practically infeasible trajectories.

Real-time planning operates by composing and adapting these validated primitives for novel scenarios. The system can handle objects not explicitly represented in the library by identifying geometric and dynamic similarities with known manipulation patterns, enabling limited generalization without extensive retraining.

## Implications for Humanoid Robotics Development

This research direction has significant implications for companies developing dexterous manipulation capabilities in humanoid systems. Non-prehensile manipulation represents a critical gap between current robotic capabilities and the manipulation dexterity required for general-purpose humanoid robots in unstructured environments.

The library-driven approach offers a potential middle ground between the data requirements of end-to-end learning and the brittleness of purely geometric planning methods. For humanoid robotics companies, this suggests a development pathway that combines systematic primitive acquisition with hierarchical planning frameworks rather than relying solely on large-scale data collection or simplified contact models.

The emphasis on physical realizability constraints also aligns with broader industry trends toward more robust sim-to-real transfer. As humanoid robots transition from research demonstrations to commercial deployment, ensuring that planned motions can be executed reliably becomes increasingly critical for practical applications.

## Key Takeaways

- LDHP introduces a hierarchical planning framework that combines pre-computed motion libraries with real-time adaptation for non-prehensile manipulation
- The approach addresses critical gaps in both search-based methods that ignore physical constraints and learning-based approaches that require extensive training data
- Library-driven planning ensures physical realizability by validating motion primitives for specific gripper configurations and contact scenarios
- The framework enables limited generalization to novel objects by identifying similarities with known manipulation patterns
- This research direction offers a promising middle ground between data-intensive learning and brittle geometric planning for dexterous manipulation

## Frequently Asked Questions

**What is non-prehensile manipulation in robotics?**
Non-prehensile manipulation involves moving and controlling objects without grasping them, using techniques like pushing, sliding, pivoting, or rolling. This capability is essential for handling thin, large, or delicate objects that cannot be effectively grasped by robotic grippers.

**How does LDHP differ from existing manipulation planning methods?**
LDHP combines pre-computed libraries of validated motion primitives with hierarchical planning, ensuring physical realizability while maintaining flexibility. This contrasts with search-based methods that often generate unrealizable motions and learning-based approaches that require extensive training datasets.

**What types of objects benefit most from non-prehensile manipulation?**
Objects that are too thin to grasp securely (like paper or fabric), too large for the gripper span, too delicate to grip safely, or have irregular shapes that make stable grasping difficult benefit most from non-prehensile manipulation techniques.

**Can LDHP handle objects not in its motion library?**
Yes, LDHP can generalize to novel objects by identifying geometric and dynamic similarities with objects represented in its motion primitive library, enabling limited zero-shot manipulation without requiring specific training for each new object.

**What are the main technical challenges in non-prehensile manipulation?**
Key challenges include accurate contact modeling, predicting object motion under complex surface interactions, handling uncertainty in friction and surface properties, and generating motion sequences that account for gripper geometry and physical constraints.