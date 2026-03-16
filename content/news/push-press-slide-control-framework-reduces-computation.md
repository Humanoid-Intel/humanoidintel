---
title: "Push-Press-Slide: New Control Framework Cuts Compute 10x"
slug: "push-press-slide-control-framework-reduces-computation"
date: "2026-03-16T08:30:00Z"
updated: "2026-03-16T08:30:00Z"
category: "research"
tags: ["manipulation", "control-theory", "non-prehensile", "contact-dynamics"]
companies: []
robots: []
excerpt: "MIT researchers develop mode-aware framework that reduces planar manipulation computation by order of magnitude"
featured: false
sources:
  - title: "Push, Press, Slide: Mode-Aware Planar Contact Manipulation via Reduced-Order Models"
    url: "https://arxiv.org/abs/2603.12399"
---

# Can Robots Finally Master Push-Press-Slide Without Breaking the Bank?

A new control framework from MIT researchers achieves **10x computational reduction** in non-prehensile planar manipulation by explicitly modeling contact mode transitions rather than treating them as disturbances. The approach enables real-time control of pushing, pressing, and sliding operations that have traditionally required expensive iterative solvers.

The mode-aware framework addresses the fundamental challenge in contact-rich manipulation: hybrid dynamics where objects transition between sliding, sticking, and separating states create discontinuities that break standard control assumptions. Previous approaches either simplified contact models (losing accuracy) or used computationally intensive methods incompatible with real-time control.

By decomposing manipulation into discrete contact modes—each governed by reduced-order dynamics—the researchers achieve stable control across mode transitions. Their framework handles both single and dual-arm scenarios, automatically selecting appropriate contact topologies based on task requirements. Testing shows successful manipulation across varying friction coefficients and contact geometries, with control frequencies suitable for hardware implementation.

This work matters because non-prehensile manipulation is ubiquitous in manufacturing, household robotics, and warehouse automation, yet remains one of robotics' most computationally demanding control problems.

## Breaking the Contact Dynamics Bottleneck

Traditional contact-rich manipulation suffers from the "curse of hybrid dynamics"—systems that switch between continuous and discrete states create mathematical nightmares for real-time controllers. When a robot pushes an object, the contact can transition between sliding (kinetic friction), sticking (static friction), and breaking contact entirely. Each transition creates discontinuities that traditional smooth control theory cannot handle elegantly.

The MIT team's insight was treating these mode switches as features, not bugs. Instead of fighting the hybrid nature with computationally expensive quasi-static assumptions or iterative contact solvers, they explicitly model each contact mode with its own reduced-order dynamics. This "mode-aware" approach predicts when transitions will occur and pre-computes the appropriate control actions.

The framework supports three fundamental manipulation primitives: pushing (maintaining contact while sliding), pressing (applying normal forces without relative motion), and sliding (controlled tangential motion under pressure). By combining these primitives, the system handles complex manipulation sequences that previously required human-tuned state machines or learning-based approaches with limited generalization.

## Dual-Arm Coordination Without Exponential Complexity

One of the framework's most significant contributions addresses dual-arm manipulation complexity. Coordinating two arms in contact-rich tasks traditionally scales exponentially with the number of contact points and potential mode combinations. A dual-arm system pushing a single object can theoretically exhibit 3^4 = 81 different contact mode combinations across four potential contact points.

The researchers' solution involves hierarchical decomposition: first selecting the optimal contact topology (which contact points should be active), then computing reduced-order dynamics for that topology. This approach reduces the search space from exponential to linear in the number of contact points.

Their contact topology selection algorithm considers task objectives, workspace constraints, and manipulator kinematics to identify feasible contact configurations. Once selected, each topology maps to a specific reduced-order model that captures the essential dynamics while remaining computationally tractable.

Testing on dual-arm scenarios shows successful coordination for tasks like cooperative pushing of large objects and precision positioning requiring synchronized force application. The framework automatically handles load distribution between arms and compensates for asymmetric friction conditions.

## Real-Time Performance Meets Theoretical Rigor

The computational efficiency gains stem from replacing high-dimensional contact solvers with analytical solutions to reduced-order systems. Traditional approaches discretize contact dynamics using linear complementarity problems (LCPs) or variational inequalities that require iterative solvers with no guaranteed convergence time.

The mode-aware framework precomputes analytical solutions for each contact mode's dynamics, enabling constant-time control updates. Mode transition detection uses geometric and force-based criteria that evaluate in microseconds rather than the milliseconds required by iterative methods.

Experimental validation demonstrates control frequencies exceeding 1 kHz on standard robotics hardware—a 10x improvement over comparable quasi-static planners. This performance enables reactive behaviors previously impossible with contact-rich manipulation, such as recovering from unexpected contact loss or adapting to varying surface properties.

## Key Takeaways

- **10x computational reduction** achieved by modeling contact modes explicitly rather than as disturbances
- **Hierarchical decomposition** enables dual-arm coordination without exponential complexity scaling
- **Real-time control frequencies (>1kHz)** make reactive contact manipulation feasible on standard hardware
- **Mode-aware framework** handles push/press/slide primitives with automatic topology selection
- **Analytical solutions** replace iterative contact solvers, guaranteeing bounded computation time

## Frequently Asked Questions

**How does this compare to learning-based manipulation approaches?**
The mode-aware framework provides theoretical guarantees and interpretable behavior that pure learning methods cannot match. While neural approaches might achieve similar task success rates, they lack the predictable performance and failure mode analysis crucial for industrial deployment.

**Can this framework handle 3D manipulation or just planar tasks?**
The current work focuses on planar manipulation, but the authors indicate the mathematical framework extends to 3D. However, 3D contact dynamics introduce significantly more mode combinations and computational complexity that may limit real-time performance.

**What hardware requirements does this approach have?**
The framework requires force/torque sensing for mode transition detection and high-frequency control updates. Standard industrial manipulators with 1kHz control loops and 6-axis force sensors meet these requirements without additional hardware.

**How does this handle uncertain friction coefficients?**
The reduced-order models incorporate friction parameters that can be estimated online or learned from data. The framework includes robust control techniques to handle friction uncertainty within bounded ranges.

**What's the path to commercial deployment?**
The mathematical framework is implementation-ready, but commercial deployment requires integration with specific robot control systems and extensive testing across diverse manipulation scenarios. The computational efficiency makes it suitable for embedded control systems used in industrial automation.