---
term: "Whole-Body Control"
slug: "whole-body-control"
category: "software"
definition: "A robot control framework that simultaneously optimizes joint torques across all degrees of freedom to achieve multiple objectives — balance, end-effector positioning, joint limit compliance — as a unified optimization problem."
relatedTerms: ["inverse-kinematics", "degrees-of-freedom", "gait-cycle", "proprioception"]
---

Whole-Body Control (WBC) is the control framework that allows a humanoid robot to use its entire body — legs, torso, and arms — in a coordinated way to accomplish manipulation tasks. The challenge it solves is fundamental: a humanoid has more controllable joints than task constraints, creating a redundancy problem. When you ask a humanoid to move its hand to a specific position and orientation, there are infinitely many joint configurations that achieve this. WBC provides a principled way to resolve this redundancy while simultaneously satisfying balance constraints, joint limits, and other objectives.

## Why Whole-Body Control Is Necessary

In simple robotic arms bolted to a fixed base, inverse kinematics suffices: compute the joint angles that achieve the desired end-effector pose, apply them, done. The robot's base is fixed, so balance is not a consideration.

Humanoids face a fundamentally different problem. The robot must remain balanced while manipulating, which means its center of mass must remain within the support polygon defined by its feet. Simultaneously:

- Arm joints must position the end-effector at the target location and orientation
- Leg joints must maintain stability and absorb disturbances from arm motion
- Torso joints must coordinate upper and lower body efficiently
- Joint limits must not be violated
- Contact forces at the feet must not exceed friction limits (to avoid slipping)

These constraints interact in complex ways. Moving the arm shifts the center of mass, requiring compensatory leg and torso motion. If the compensation motion causes a joint to approach its limit, an alternative compensation strategy must be selected. WBC handles all of this simultaneously through a unified mathematical framework.

## Mathematical Formulation

WBC is typically formulated as a quadratic program (QP) or a hierarchical QP. The objective function minimizes weighted deviations from desired task accelerations across all constraints. A typical hierarchy:

1. **Top priority**: Joint limit enforcement and contact constraint satisfaction (never violate)
2. **High priority**: Center of mass position and momentum control (maintain balance)
3. **Medium priority**: End-effector position and orientation tracking
4. **Low priority**: Posture regularization (keep joints near a default configuration)

The hierarchical structure means higher-priority objectives are satisfied exactly whenever possible, with lower-priority objectives accommodated in the remaining solution space. This priority ordering encodes the robot's behavioral priorities: staying balanced and within joint limits matters more than reaching the exact target end-effector position.

## WBC in Commercial Humanoids

**Figure AI** uses a WBC framework integrated with its Helix VLA. Helix generates desired end-effector targets; WBC converts these to joint torque commands at 1000Hz, much faster than Helix's 50Hz inference rate. The separation of high-level task planning (Helix) from low-level whole-body control (WBC) is the standard architecture in commercial platforms.

**Boston Dynamics Atlas** (Electric) uses a WBC developed over 15 years of research at Boston Dynamics and MIT, building on the pioneering work of Russ Tedrake's Robot Locomotion Group. Atlas Electric's WBC is notable for handling highly dynamic whole-body behaviors — jumping, throwing, running — at the limits of physical feasibility.

**Agility Robotics Digit** uses a WBC that prioritizes locomotion robustness over manipulation coordination, reflecting Digit's warehouse task profile where stable, efficient bipedal locomotion matters more than complex manipulation.

## Current Research Frontiers

The leading research challenge in WBC for humanoids is integrating learning-based policies with model-based WBC. Traditional WBC requires an accurate model of the robot's dynamics — mass, inertia, actuator properties. When the robot interacts with unknown objects (picking up a box of uncertain mass, pushing against a surface of unknown stiffness), the model becomes inaccurate and WBC performance degrades.

Emerging approaches use neural networks to estimate contact forces and object properties online, feeding these estimates into the WBC's model. This adaptive WBC enables robust manipulation of unknown objects and remains an active area of development at leading labs.

---

## FAQ

**What is the difference between WBC and inverse kinematics?**
Inverse kinematics (IK) computes joint angles that achieve a desired end-effector pose, treating the robot as a static mechanism. WBC is a dynamic framework that computes joint torques (forces) while accounting for the robot's inertia, gravity, contact forces, and all motion constraints simultaneously. IK is a component within WBC — the end-effector positioning objective in the QP — but WBC encompasses much more than IK alone.

**How often does WBC run on a real humanoid?**
WBC typically runs at 500-1000 Hz (500-1000 times per second) to provide smooth, responsive torque control. This high frequency is necessary because balance corrections must respond faster than the robot can fall — a humanoid disturbed from equilibrium must begin corrective action within approximately 50ms to prevent a fall, requiring the control loop to run at 20Hz minimum, with commercial implementations running at 20-50x that rate for safety margin.

**Can WBC handle contact with objects and humans?**
Yes, this is one of WBC's key capabilities. Contact-consistent WBC includes contact forces as optimization variables and can plan arm motions that deliberately establish contact (for pushing, leaning, or supported manipulation) while maintaining balance. Whole-body contact planning is an emerging research area that enables robots to use their entire body surface for manipulation — leaning against a wall while using both hands, for example.
