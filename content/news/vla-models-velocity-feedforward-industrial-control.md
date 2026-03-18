---
title: "VLA Models Get Velocity Feedforward for Industrial Control"
slug: "vla-models-velocity-feedforward-industrial-control"
date: "2026-03-18T04:00:00.000Z"
updated: "2026-03-18T08:08:06.311Z"
category: "research"
tags: ["vla", "behavior-cloning", "industrial-robots", "control-systems"]
companies: []
robots: []
excerpt: "New research addresses VLA deployment challenges on rigid industrial robots through velocity feedforward control methods."
featured: false
sources:
  - title: "Enabling Dynamic Tracking in Vision-Language-Action Models via Time-Discrete and Time-Continuous Velocity Feedforward"
    url: "https://arxiv.org/abs/2603.16218"
---
# How Are Researchers Solving VLA Control Issues on Industrial Robots?

A new arXiv paper addresses a fundamental limitation preventing vision-language-action (VLA) models from effective deployment on rigid industrial robots. The research introduces velocity feedforward methods that bridge the gap between VLA models' discrete pose predictions and the continuous control requirements of industrial automation systems.

Standard behavior cloning approaches in VLA models predict discrete poses at frequencies typically below 10Hz, omitting the velocity and acceleration feedforward terms that industrial robots rely on for precise motion control. This creates a compliance-responsiveness trade-off that forces engineers to choose between high stiffness (poor tracking performance) or low stiffness (reduced precision and safety margins).

The paper proposes both time-discrete and time-continuous velocity feedforward approaches that enable VLA models to provide the smooth trajectory generation industrial controllers expect. Rather than requiring fundamental changes to existing VLA architectures, the methods augment standard behavior cloning with velocity prediction capabilities that can interface directly with position-velocity-acceleration controllers common in industrial settings.

This work addresses a critical bottleneck for humanoid robotics companies targeting industrial applications, where existing compliant control strategies developed for research platforms may not meet the precision and safety requirements of manufacturing environments.

## The Industrial Deployment Challenge

VLA models have demonstrated impressive capabilities in laboratory settings, particularly for dexterous manipulation tasks that require understanding of visual scenes and natural language instructions. However, their translation to industrial environments reveals fundamental control architecture mismatches.

Industrial robots typically operate using cascaded control loops with position, velocity, and acceleration feedforward terms. These systems expect continuous trajectory references at control frequencies of 100-1000Hz, not the discrete waypoints that VLA models naturally output. The resulting control gap forces system integrators into suboptimal compromises.

High stiffness configurations can track discrete waypoints but create jerky motion profiles that stress mechanical components and reduce overall system performance. Low stiffness settings provide smoother motion but sacrifice the precision and disturbance rejection capabilities that industrial applications demand.

## Technical Approach and Implementation

The research introduces two complementary methods for incorporating velocity information into VLA predictions. The time-discrete approach extends existing behavior cloning frameworks to predict both pose and velocity targets at each timestep, enabling more sophisticated feedforward control.

The time-continuous method goes further by modeling the underlying continuous trajectory that connects discrete VLA predictions. This approach uses interpolation techniques that respect the dynamic constraints of the robot system while maintaining compatibility with existing VLA training procedures.

Both methods leverage the temporal consistency inherent in VLA training data, where consecutive predictions typically represent smooth motion sequences. By explicitly modeling this temporal structure, the velocity feedforward approaches can generate control signals that industrial robots can execute more effectively.

The paper demonstrates that these modifications don't require retraining existing VLA models from scratch. Instead, the velocity prediction capabilities can be added as additional output heads or post-processing stages, preserving the substantial investment in existing model development.

## Industry Implications for Humanoid Deployment

This research has immediate relevance for humanoid robotics companies preparing for industrial deployment. Companies like Figure AI, 1X Technologies, and Agility Robotics are developing humanoids specifically for warehouse and manufacturing applications where precise motion control is critical.

The velocity feedforward approach could accelerate the transition from research demonstrations to production deployment by eliminating the need for custom control system development. Rather than building specialized compliant control stacks, humanoid manufacturers could leverage existing industrial control infrastructure.

The work also addresses safety considerations that are paramount in industrial settings. Smooth, predictable motion profiles reduce the risk of unexpected robot behavior that could endanger human workers or damage equipment. This is particularly important for humanoids operating in shared workspaces.

## Broader Impact on VLA Development

Beyond industrial applications, this research highlights important architectural considerations for next-generation VLA models. As the field moves toward more sophisticated embodied AI systems, the integration between high-level reasoning and low-level control becomes increasingly critical.

The velocity feedforward approach suggests that future VLA architectures should incorporate control-aware design principles from the beginning, rather than treating motion generation as a post-processing step. This could influence how companies like Physical Intelligence and Skild AI structure their foundation models.

The research also demonstrates the importance of sim-to-real transfer for control system design. VLA models trained in simulation environments with idealized control assumptions may not translate effectively to real-world systems with specific control requirements and constraints.

## Key Takeaways

- VLA models face fundamental control architecture mismatches when deployed on rigid industrial robots
- New velocity feedforward methods enable smooth trajectory generation without requiring VLA model retraining
- Both time-discrete and time-continuous approaches address the compliance-responsiveness trade-off in industrial settings
- The research could accelerate humanoid robot deployment in manufacturing and warehouse applications
- Future VLA architectures should incorporate control-aware design principles from initial development

## Frequently Asked Questions

**What is the main limitation of current VLA models for industrial robot deployment?**
Current VLA models predict discrete poses at low frequencies (typically <10Hz) without velocity or acceleration information, creating incompatibility with industrial control systems that require continuous trajectory references at 100-1000Hz with feedforward terms.

**How do the proposed velocity feedforward methods work?**
The methods extend VLA models to predict both pose and velocity information, either through discrete velocity targets at each timestep or by modeling continuous trajectories that connect discrete predictions. This enables smooth motion generation compatible with industrial controllers.

**Can these methods be applied to existing trained VLA models?**
Yes, the velocity prediction capabilities can be added as additional output heads or post-processing stages without requiring complete model retraining, preserving existing development investments.

**What impact does this research have on humanoid robot development?**
The research addresses critical control system challenges for humanoid deployment in industrial settings, potentially accelerating the transition from research demonstrations to production applications in warehouses and manufacturing facilities.

**Why is smooth motion control important for industrial robot applications?**
Smooth, predictable motion profiles are essential for safety in shared workspaces, reduce mechanical stress on robot components, and meet the precision requirements of manufacturing processes that industrial applications demand.