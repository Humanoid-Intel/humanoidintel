---
term: "Tendon-Driven"
slug: "tendon-driven"
category: "hardware"
definition: "A robotic actuation architecture in which joints are driven by cables or tendons routed from remote actuators, enabling high DOF distal joints (like fingers) to be controlled by motors located proximally in the arm or body."
relatedTerms: ["harmonic-drive", "backdrivability", "dexterous-manipulation", "degrees-of-freedom"]
---

Tendon-driven actuation replicates the fundamental mechanical architecture of the human musculoskeletal system. In the human arm, finger joints are controlled by muscles located in the forearm, connected to the fingers through long tendons passing through the wrist. This remote-actuation arrangement enables the hand and fingers to be slim and lightweight — they contain no bulky muscle tissue — while still being driven by large, powerful muscles that can generate the forces needed for grasping.

Robot designers use the same principle to solve the same problem: how to achieve high degrees of freedom in a small, lightweight end-effector (hand) when motors large enough to generate useful joint torques are too heavy and bulky to fit inside the finger structure itself.

## Architecture and Routing

In a tendon-driven hand, motors (or other actuators) are located in the forearm, palm, or even the robot's torso. Cables — typically made from ultra-high molecular weight polyethylene (UHMWPE, such as Dyneema or Spectra), stainless steel strand, or specialty polymer fibers — run from these actuators through low-friction sheaths or pulleys to the distal joints they control.

The routing path matters enormously for performance:

**Antagonistic pairs**: Most tendon-driven joints use two tendons per DOF, one for flexion and one for extension. The motor can pull either tendon to drive the joint in either direction. This mimics the bicep-tricep muscle pairing in the human arm and allows both position and stiffness to be controlled independently.

**Coupled joints**: Some finger joint pairs (like the DIP and PIP joints in human fingers) can be driven by a single tendon that crosses both joints. This reduces the actuator count at the cost of losing independent control over each joint — the joints move in a coupled ratio. This tradeoff is common in hand designs where motor count is the binding constraint.

**Routing path design**: Tendons routed over pulleys change force direction but maintain tension. The pulley arrangement determines the joint's moment arm, and therefore the mechanical advantage between motor force and joint torque. Careful routing allows the same motor size to produce different joint torques at different joints.

## Clone Robotics' Myofiber Approach

Clone Robotics takes tendon-driven actuation to its architectural extreme with Myofibers: fluid-powered artificial muscles that contract when pressurized with hydraulic fluid, directly analogous to biological muscle. Rather than electric motors and cables, Myofibers are the actuators — and rather than a few large actuators per limb, the Clone P1 uses hundreds of individual Myofibers to replicate the full musculoskeletal anatomy.

The P1's 206 DOF (orders of magnitude beyond any conventional design) is only achievable because Myofibers are thin enough to route alongside each other in anatomically correct positions, just as the human body's 640+ muscles occupy the same volume. The tradeoff is control complexity: commanding 200+ Myofibers simultaneously to produce a useful hand motion requires solving a muscle-space-to-joint-space mapping that remains one of the hardest problems in the field.

## Advantages Over Motor-Per-Joint Designs

**Distal weight reduction**: For the same joint torque at a fingertip, a tendon-driven design can be 40-70% lighter at the distal end than a motor-per-joint design. This reduces inertia, enabling faster movements and reducing the risk of injury in human-robot contact.

**Higher DOF ceiling**: The slimness of tendons allows routing paths that are impossible for motor+gearbox assemblies. Clone P1's 26 DOF/hand versus a typical motor-per-joint hand's 8-12 DOF illustrates this advantage.

**Natural compliance**: Tendons are slightly elastic, providing passive compliance similar to biological tendons. This compliance aids in shock absorption and makes contact with humans inherently gentler.

## Disadvantages

**Friction and hysteresis**: Tendons routed through sheaths accumulate friction at each bend. Over multiple bends, the relationship between motor position and joint position becomes nonlinear and hysteretic — the joint position when moving in one direction differs from the position when moving in the other at the same motor state.

**Stiffness limitations**: Tendons stretch under load. High-stiffness tendons minimize this but increase failure risk. The result is that tendon-driven joints are less stiff than rigid gear drives, limiting precise positioning under load.

**Reliability and maintenance**: Tendons wear, stretch, and break. A tendon failure in a complex routed system can require significant disassembly to replace — a significant maintenance concern for commercial deployment.

---

## FAQ

**Which commercial humanoids use tendon-driven hands?**
Clone Robotics P1 is the most extensive tendon (Myofiber) implementation in any humanoid. Several research humanoids use cable-driven hands (the DEXMART Hand, the DLR Hand II). Most commercial humanoids use motor-per-joint designs with rigid drives for reliability and serviceability, accepting the DOF ceiling this imposes.

**Why do most commercial humanoids use rigid drives instead of tendons?**
Reliability and serviceability. A failed rigid actuator in a finger is replaceable in minutes. A broken tendon in a complex routing system can require hours of disassembly. For commercial deployments with uptime requirements of 95%+, the maintenance burden of tendon systems is currently prohibitive. As tendon material science and routing designs mature, this calculus may shift.

**What materials are robot tendons made from?**
High-performance tendon materials include Dyneema SK75 (UHMWPE braid, 3.5 GPa tensile strength, near-zero stretch), stainless steel strand (higher stiffness, heavier, risk of corrosion in humid environments), and Vectran (liquid crystal polymer, intermediate between Dyneema and steel). The Shadow Hand (a leading research dexterous hand) uses Dyneema tendons and replaces them as part of regular preventive maintenance.
