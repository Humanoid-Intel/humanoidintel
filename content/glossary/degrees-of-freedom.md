---
term: "Degrees of Freedom"
slug: "degrees-of-freedom"
category: "hardware"
definition: "The number of independent axes of movement a robot joint system can execute, determining the range and complexity of motions the robot can perform."
relatedTerms: ["actuator", "end-effector", "whole-body-control", "inverse-kinematics"]
---

Degrees of freedom (DOF) is the most commonly cited — and most commonly misunderstood — specification in humanoid robotics. A single DOF represents one independent axis of movement: a hinge joint rotating around a single axis has 1 DOF; a ball-and-socket joint capable of rotation in three planes has 3 DOF. The adult human body has approximately 244 DOF when accounting for all movable joints including the spine, hands, and feet.

In humanoid robotics, DOF counts are used to describe both individual joints and the entire robot. A robot with "44 DOF" — like Figure AI's Figure 02 — has 44 independent joint axes distributed across its body: typically 6-7 per leg, 7-8 per arm, and 14-16 per hand in the case of dexterous platforms. The number matters because higher DOF enables more complex and human-analogous motion, but also requires more actuators, controllers, sensors, and more sophisticated motion planning algorithms.

## DOF Across Body Regions

**Hands**: The human hand has approximately 27 DOF. Most commercial humanoids underserve hand DOF significantly — early designs had 3-5 DOF per hand, limiting them to power grasps and simple pick-and-place. Next-generation platforms (Figure 03 at 22 DOF/hand, Clone Robotics P1 at an unprecedented 206 total body DOF using tendon-driven architecture) are approaching more complete hand functionality.

**Arms**: Human arms have 7 DOF each (3 shoulder, 1 elbow, 3 wrist). Most humanoid arms replicate this count, since 7 DOF is the minimum for full dexterity in 3D space (6 DOF for positioning and orientation, plus one redundant DOF for obstacle avoidance). Some designs add an 8th DOF for wrist roll.

**Legs**: Human legs have 7 DOF each (3 hip, 1 knee, 3 ankle). Humanoid legs often use 6 DOF per leg, omitting foot inversion/eversion in designs where a rigid ankle suffices for flat-floor locomotion.

**Spine and torso**: Often simplified to 2-3 DOF in humanoids, versus 24 vertebral segments in humans. Platforms with minimal torso DOF sacrifice the whole-body coordination that allows humans to brace against manipulation forces, transfer momentum between upper and lower body, and recover from perturbations.

## DOF vs. Practical Dexterity

DOF count is a necessary but not sufficient measure of robot capability. A robot with 44 DOF and precise actuators and good control software will outperform a robot with 60 DOF and poor actuators. The relevant performance metric is the set of tasks the robot can execute reliably, not the raw joint count.

Additionally, DOF that cannot be independently controlled — for example, tendon-coupled finger joints that must move together — do not provide as much functional flexibility as the DOF count implies. When evaluating DOF specifications, it is worth asking whether each degree of freedom has an independent actuator, an independent sensor, and an independent controller.

---

## FAQ

**Why don't humanoids just replicate the full human DOF count?**
Cost, reliability, and control complexity. Each additional DOF adds an actuator, encoder, motor controller, and associated wiring and structure — increasing cost, weight, and failure probability. More DOF also requires more sophisticated motion planning: the computational cost of planning a 244-DOF motion is orders of magnitude higher than planning a 44-DOF motion. Commercial designs balance DOF against the specific task requirements of their target deployment environment.

**What is the minimum DOF for useful manipulation?**
Research consensus suggests approximately 22-28 total arm+hand DOF per manipulator is sufficient for 80-90% of common manipulation tasks. This corresponds roughly to a 7-DOF arm with a 3-4 finger hand having 2 DOF per finger. Platforms at this level (Agility Digit, many research arms) can perform most warehouse and light assembly tasks that humanoid deployments currently target.

**How does DOF relate to payload?**
There is generally an inverse relationship: higher DOF designs use smaller actuators to keep weight manageable, which typically reduces the maximum force each actuator can produce, which limits payload. High-payload humanoids (Kepler Forerunner at 35 kg) achieve this by using larger, stiffer actuators at the cost of DOF count and fine manipulation capability.
