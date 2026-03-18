---
title: "VLA Models Get Velocity Feedforward for Industrial Robots"
slug: "vla-models-velocity-feedforward-industrial-robots"
date: "2026-03-18T04:00:00.000Z"
updated: "2026-03-18T07:03:01.595Z"
category: "research"
tags: ["vla-models", "behavior-cloning", "industrial-robotics", "velocity-feedforward"]
companies: []
robots: []
excerpt: "New research addresses VLA model deployment on rigid industrial robots through velocity feedforward mechanisms"
featured: false
sources:
  - title: "Enabling Dynamic Tracking in Vision-Language-Action Models via Time-Discrete and Time-Continuous Velocity Feedforward"
    url: "https://arxiv.org/abs/2603.16218"
---
# How Can VLA Models Work Better on Industrial Robots?

Researchers have identified a critical gap preventing vision-language-action (VLA) models from effective deployment on rigid industrial robots: the lack of velocity and acceleration feedforward terms that compliant controllers typically require. A new paper published on arXiv today proposes time-discrete and time-continuous velocity feedforward mechanisms to bridge this gap between high-level VLA predictions and low-level industrial control systems.

The core problem stems from standard Behavior Cloning (BC) approaches that predict discrete poses at low frequencies while omitting the velocity feedforward terms essential for compliant control. This forces industrial systems to rely on high-stiffness configurations that sacrifice the compliance advantages that make VLA models attractive for complex manipulation tasks.

The research addresses the fundamental trade-off between compliance and responsiveness that has limited VLA model adoption in industrial settings. By incorporating velocity feedforward into the VLA architecture, the approach aims to enable smoother, more responsive control while maintaining the flexibility that makes these models powerful for dexterous manipulation tasks.

## The Industrial VLA Deployment Challenge

VLA models have demonstrated impressive capabilities in research environments, combining natural language understanding with visual perception and action generation. However, their transition to industrial robotics has been hindered by control system incompatibilities.

Traditional industrial robots operate with position-based controllers that rely heavily on feedforward terms for smooth motion. Standard VLA approaches output target poses without considering the velocity profile needed to reach those poses efficiently. This mismatch creates jerky, inefficient movements when VLA commands are executed on industrial hardware.

The velocity feedforward problem becomes particularly acute in applications requiring precise tracking of dynamic trajectories. Without proper velocity information, industrial controllers must use high gains to achieve acceptable tracking performance, resulting in rigid, non-compliant behavior that negates many advantages of VLA-based control.

## Technical Approach: Dual Velocity Feedforward

The research introduces both time-discrete and time-continuous velocity feedforward mechanisms designed to work within existing VLA architectures. The time-discrete approach provides velocity estimates at the same frequency as pose predictions, while the time-continuous method generates smooth velocity profiles between discrete prediction steps.

This dual approach addresses different aspects of the industrial control challenge. Time-discrete feedforward helps with computational efficiency and integration with existing VLA training pipelines, while time-continuous feedforward provides the smooth motion profiles that industrial applications demand.

The implementation leverages existing VLA model architectures while adding velocity prediction heads that can be trained alongside standard pose prediction objectives. This allows the enhanced models to maintain compatibility with current sim-to-real training approaches while adding the velocity information needed for industrial deployment.

## Implications for Humanoid Development

While the research focuses on industrial manipulation, the velocity feedforward approach has direct relevance for humanoid robotics development. Humanoid robots face similar challenges when translating high-level VLA commands into smooth, coordinated whole-body motion.

Current humanoid systems often struggle with the transition from discrete action predictions to continuous motion execution. The velocity feedforward mechanisms could enable more natural movement patterns by providing the motion continuity information that whole-body controllers need.

For companies developing commercial humanoids, this research suggests a path toward more responsive and natural-looking robot behavior. Rather than the sometimes jerky movements characteristic of current VLA-controlled robots, velocity feedforward could enable the fluid motion necessary for humanoids operating in human environments.

## Key Takeaways

- VLA models struggle on industrial robots due to missing velocity feedforward terms in standard Behavior Cloning approaches
- New research proposes both time-discrete and time-continuous velocity feedforward mechanisms to address this gap
- The approach enables smoother, more compliant control while maintaining VLA model flexibility
- Implementation is compatible with existing VLA architectures and sim-to-real training pipelines
- The methodology has direct applications for humanoid whole-body control and natural movement generation

## Frequently Asked Questions

**What are velocity feedforward terms and why do industrial robots need them?**
Velocity feedforward terms provide information about intended motion velocity to low-level controllers, enabling smooth trajectory tracking. Industrial robots use these terms to reduce tracking errors and achieve compliant behavior without high control gains.

**How does this research differ from standard VLA model approaches?**
Standard VLA models only predict target poses, while this approach adds velocity prediction capabilities. This enables better integration with industrial control systems that expect both position and velocity information.

**Can this velocity feedforward approach work with existing VLA models?**
Yes, the research designs the velocity feedforward mechanisms to be compatible with current VLA architectures, allowing existing models to be enhanced without complete retraining.

**What impact could this have on humanoid robot development?**
Humanoid robots could benefit from smoother, more natural movement patterns by incorporating velocity feedforward into their whole-body control systems, addressing current issues with jerky VLA-controlled motion.

**How does this address the compliance versus responsiveness trade-off?**
By providing proper velocity information to low-level controllers, the approach enables compliant behavior without sacrificing responsiveness, eliminating the need for high-stiffness configurations that create rigid robot behavior.