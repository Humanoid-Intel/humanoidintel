---
term: "Harmonic Drive"
slug: "harmonic-drive"
category: "hardware"
definition: "A compact, zero-backlash gear transmission using a flexible spline deformed by an elliptical wave generator, achieving high gear ratios (50:1 to 320:1) in a lightweight form factor widely used in robot joints."
relatedTerms: ["tendon-driven", "backdrivability", "actuator", "degrees-of-freedom"]
---

The harmonic drive (also called a strain wave gear) is the most common transmission mechanism in commercial humanoid robots and collaborative robot arms. Invented by Clarence Walton Musser in 1955 and commercialized by Harmonic Drive AG (Germany) and Harmonic Drive LLC (USA/Japan), the technology has been a staple of precision robotics for four decades.

## How a Harmonic Drive Works

A harmonic drive has three components:

1. **Wave generator**: An elliptical disc with a thin-race ball bearing pressed onto it. Driven by the motor, it rotates and causes the flexspline to deform into an ellipse.

2. **Flexspline**: A thin-walled, flexible steel cup with external teeth. The wave generator inside deforms it into an ellipse, causing its teeth to engage the circular spline at the two points of the ellipse.

3. **Circular spline**: A rigid ring with internal teeth. It has 2 more teeth than the flexspline.

As the wave generator rotates once, the flexspline precesses, and the difference in tooth count between flexspline and circular spline causes a large, predictable reduction ratio. A harmonic drive with a 100-tooth circular spline and 98-tooth flexspline produces a 50:1 reduction ratio. This is the gear ratio — 50 motor rotations produce 1 output rotation.

## Why Harmonic Drives Dominate Robot Joint Design

**Zero backlash**: The flexspline-circular spline interface has no backlash — the tooth mesh is continuous. This enables joint position accuracy of < 0.01° (< 0.2 arcminutes), which is critical for tasks requiring precise end-effector placement.

**High ratio in compact package**: A 100:1 gear ratio in a planetary gearbox requires a gearbox diameter approximately 4x the harmonic drive equivalent. For robot joints where internal diameter must accommodate through-bore wiring and the overall link must be aesthetically proportioned, harmonic drives are unmatched in space efficiency.

**High torque density**: The flexspline tooth mesh engages approximately 30% of all teeth simultaneously (versus 1-2 teeth in conventional gearing), distributing load over many contact points and enabling very high peak torque from a compact assembly.

**Torsional stiffness**: High stiffness means the joint behaves as if it were a rigid mechanism under normal operating loads, enabling accurate position control without needing to compensate for drivetrain compliance.

## The Backdrivability Tradeoff

Harmonic drives' main disadvantage for next-generation dexterous manipulation is low backdrivability. A backdrivable joint allows external forces to move it — the motor can be pushed backward by external contact. This property is essential for force-controlled tasks where the robot must comply with contact forces.

A 100:1 harmonic drive has a backdrivability efficiency of approximately 30-40%, meaning that 60-70% of an externally applied force is lost to friction in the flexspline tooth mesh. The robot can detect external forces through dedicated force-torque sensors, but cannot passively comply with them the way a Series Elastic Actuator or direct-drive joint can.

This limitation has driven research into quasi-direct-drive joints (low ratio, high-torque motors without harmonic drives) for manipulation tasks requiring force compliance, while harmonic drives remain preferred for locomotion joints where stiffness and precision matter more than compliance.

## Who Supplies Harmonic Drives

**Harmonic Drive AG** (Germany, now part of Japan-based Harmonic Drive Group): Premium manufacturer, dominant in Europe and research/premium robotics applications.

**Nidec-Shimpo**: Lower-cost harmonic drives used in many Chinese commercial humanoid designs.

**Nabtesco**: Cycloidal drive alternative with similar characteristics, used in some industrial robot applications.

The supply chain concentration in harmonic drives is a strategic risk for the humanoid industry. Most commercial humanoids depend on Japanese or German suppliers for this critical component. Lead times for specialty harmonic drives can reach 6-12 months, creating manufacturing bottlenecks at current humanoid production volumes.

---

## FAQ

**What is the difference between a harmonic drive and a cycloidal drive?**
Both are high-ratio compact gearboxes used in robotics, but with different mechanisms. A cycloidal drive uses one or two eccentric lobes rotating inside a ring gear, with a different load distribution than the flexspline engagement in a harmonic drive. Cycloidal drives generally have slightly higher torsional rigidity and better shock load tolerance; harmonic drives have marginally lower backlash. Both are used in humanoid joints, with harmonic drives more common in manipulator arms and cycloidal drives more common in locomotion joints where shock loads are higher.

**Why do harmonic drives fail and how often?**
The primary failure mode is flexspline fatigue fracture from cyclic stress under load. At rated torque, harmonic drives are rated for 5,000-30,000 hours depending on the model and operating conditions. Shock loads — the robot falling, collisions, rapid direction reversals — can dramatically reduce service life. Temperature also matters: flexspline steel fatigue life degrades significantly above 70°C, which can be reached in continuously loaded joints without adequate thermal management.

**Can harmonic drives be replaced in the field?**
Yes, harmonic drive modules are designed to be replaceable as a unit. Most commercial humanoid service procedures for harmonic drive replacement require 30-90 minutes per joint with appropriate tools. Field replacement capability is an important serviceability consideration for enterprise fleet operators.
