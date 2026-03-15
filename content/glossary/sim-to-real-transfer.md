---
term: "Sim-to-Real Transfer"
slug: "sim-to-real-transfer"
category: "software"
definition: "The process of training a robot control policy in simulation and successfully deploying it on physical hardware, bridging the gap between simulated and real-world physics."
relatedTerms: ["imitation-learning", "whole-body-control", "urdf", "zero-shot-generalization"]
---

Sim-to-real transfer (also written sim2real) is one of the central technical problems in modern robot learning. The appeal of simulation is obvious: a physics simulator can run thousands of robot experiments in parallel at speeds far faster than real time, accumulating training data that would take years to collect on physical hardware. The challenge is that simulations are imperfect models of the physical world, and policies trained in simulation often fail when deployed on real robots — a phenomenon called the "reality gap."

## Why the Reality Gap Exists

Physics simulators approximate real-world dynamics using differential equations. The approximations introduce several systematic inaccuracies:

**Contact and friction modeling**: Real surfaces have complex, geometry-dependent friction coefficients that depend on normal force, sliding velocity, material compliance, and surface texture. Simulators typically use simplified friction models (Coulomb friction, often with a single coefficient per material pair). Policies that rely on precise friction behavior — grasping, sliding objects on tables, walking on varied surfaces — are particularly sensitive to this gap.

**Actuator dynamics**: Real motors have electrical inductance, back-EMF, nonlinear torque curves, heat-dependent behavior, and communication latency. Simulators model actuators as ideal torque or velocity sources. A policy trained with simulated ideal actuators will send commands that exceed real actuator bandwidth or assume response times faster than the physical hardware provides.

**Sensor noise**: Real sensors (cameras, IMUs, joint encoders) produce noisy, quantized measurements. Simulated sensors are typically perfect or noise-parameterized with idealized Gaussian noise — a poor match for real-world sensor artifacts including occlusion, reflections, and signal dropout.

## Techniques for Closing the Gap

**Domain Randomization**: Randomize simulator parameters (friction coefficients, object masses, camera positions, lighting) across a wide range during training. If the real world falls within the randomization distribution, the policy generalizes. OpenAI pioneered this approach in 2018 for the Dexterous Manipulation Hand project, successfully training cube-manipulation policies in simulation that transferred to a real Shadow Hand.

**Domain Adaptation**: Use real-world data — even unlabeled — to adapt either the simulator or the policy to better match real conditions. Adversarial domain adaptation trains a discriminator to distinguish simulated from real sensor data, and adjusts the simulator rendering to fool the discriminator.

**System Identification (SysID)**: Measure the real robot's physical properties (joint friction, motor constants, link masses) and use these to parameterize the simulator accurately. More careful SysID reduces the gap at the cost of significant engineering effort per robot platform.

**Real-Data Fine-Tuning**: Train the initial policy in simulation for data efficiency, then fine-tune on a smaller amount of real-world data collected on the physical robot. This approach is used by most commercial humanoid companies — simulation provides the behavioral backbone, real data corrects systematic errors.

## Current State in Humanoid Robotics

Sim-to-real transfer for locomotion is largely solved. Bipedal walking policies for humanoid robots can now be trained entirely in simulation and deployed with minimal tuning — a milestone that was beyond the state of the art in 2020. The challenge has shifted to manipulation.

For dexterous manipulation, the contact-heavy nature of grasping and assembly tasks makes sim-to-real one of the active bottlenecks. Physical Intelligence's π0 and π0.2 models bypass the problem partially by collecting massive amounts of real-world teleoperation data, effectively making real data the primary training source and reducing dependence on sim-to-real transfer.

NVIDIA's Isaac Sim and DeepMind's MuJoCo remain the dominant simulation platforms for humanoid policy training. NVIDIA's recent investment in photorealistic rendering (through its Omniverse platform) targets the visual domain gap specifically.

---

## FAQ

**Is sim-to-real transfer a solved problem for humanoids?**
For locomotion (walking, running, climbing stairs), sim-to-real transfer is largely solved — policies trained in simulation transfer to real hardware with minimal adaptation. For dexterous manipulation, it remains one of the most active research frontiers, particularly for tasks involving deformable objects, complex contact, or high-precision placement.

**How long does sim-to-real fine-tuning typically take on physical hardware?**
For locomotion policies, fine-tuning after sim training typically requires 1-4 hours of real-world data collection. For manipulation policies, physical fine-tuning requirements range from a few hours (for simple grasping) to several weeks (for complex assembly tasks) depending on the sensitivity of the task to the reality gap.

**What simulator do most humanoid companies use?**
NVIDIA Isaac Sim (built on PhysX) and DeepMind's MuJoCo are the most widely used research and commercial platforms. Tesla uses its own internal simulator optimized for Optimus-specific kinematics. Figure AI uses Isaac Sim with extensive custom extensions for its Helix training pipeline.
