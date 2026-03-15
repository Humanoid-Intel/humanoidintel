---
term: "Inverse Kinematics"
slug: "inverse-kinematics"
category: "software"
definition: "The mathematical process of computing the joint angles required to achieve a desired end-effector position and orientation, working backwards from the task-space goal to the joint-space solution."
relatedTerms: ["degrees-of-freedom", "whole-body-control", "end-effector", "urdf"]
---

Inverse kinematics (IK) is one of the most fundamental computations in robotics. Given a target position and orientation for the robot's hand in 3D space, IK computes the joint angles for every joint in the arm required to put the hand there. The "inverse" distinguishes it from forward kinematics (FK), which computes the end-effector position given known joint angles — a simpler, direct calculation.

IK is fundamental to nearly all robot motion because the world is specified in task space (where do I want the hand?) but robots are controlled in joint space (what angle should each motor be at?). Every movement command that reaches a humanoid robot's actuators has passed through IK to convert the task-space instruction into joint-space targets.

## The Mathematical Challenge

For a robot arm with N degrees of freedom, IK requires solving a system of equations:

- The arm's kinematic chain (defined by the robot's URDF) specifies how each joint's position and orientation depends on all preceding joint angles
- Forward kinematics gives us: x = f(θ₁, θ₂, ..., θₙ) — the end-effector pose x given joint angles θ
- Inverse kinematics asks: given desired pose x*, find θ* such that f(θ*) = x*

For simple 6-DOF arms, closed-form analytical IK solutions exist — exact equations that compute all valid joint configurations producing the desired pose. These are fast to compute and produce exact solutions.

For 7+ DOF arms (like most humanoid arms, which have 7 DOF for kinematic redundancy), there are infinitely many solutions for any achievable end-effector pose. This redundancy is useful — it enables the arm to avoid obstacles or joint limits while maintaining the hand position — but requires optimization to select the best solution among the infinite set.

## IK Solvers

**Analytical IK**: Closed-form equations derived from the robot's specific kinematic structure. Fast (microseconds to compute), exact, and deterministic. Only applicable to robots with specific geometric configurations (typically 6-DOF serial arms with spherical wrist).

**Jacobian-based iterative IK**: Iteratively adjusts joint angles using the kinematic Jacobian (the matrix relating joint velocities to end-effector velocities). Computationally simple and general-purpose, but can get stuck in local minima and may not find solutions near kinematic singularities (configurations where the Jacobian loses rank).

**Gradient descent and optimization-based IK**: Formulates IK as an optimization problem minimizing end-effector position error plus regularization terms (joint limit penalties, preferred posture terms). More robust than Jacobian methods but slower.

**Learning-based IK**: Neural networks trained to predict joint configurations from end-effector poses. Can be faster than optimization at runtime if trained offline. Increasingly used for real-time IK in whole-body control pipelines.

**IKFAST / analytical solvers for specific robots**: Pre-compiled analytical IK solvers for specific robot models (popularized by the MoveIt/OpenRAVE ecosystem). Very fast, robot-specific.

## IK in the Context of Whole-Body Control

In a modern humanoid, IK is typically a component within the whole-body control (WBC) framework rather than a standalone computation. The WBC formulates a quadratic program that simultaneously handles:
- End-effector position tracking (IK task)
- Balance maintenance (CoM constraint)
- Joint limit avoidance
- Collision avoidance

This integrated formulation handles the coupling between arm IK and balance that standalone arm IK ignores. A 7-DOF arm IK solver for a humanoid that ignores the effect of arm motion on the robot's center of mass will command motions that destabilize balance — exactly the problem WBC exists to solve.

## Kinematic Singularities

Kinematic singularities are configurations where the robot's Jacobian loses rank — the robot loses one or more degrees of controllable end-effector motion. Common singularities:

- **Elbow singularity**: Elbow fully extended or fully flexed, arm fully straight
- **Shoulder singularity**: First three shoulder joint axes align
- **Wrist singularity**: Two or more wrist axes align

Near singularities, small end-effector velocity commands require very large (potentially infinite) joint velocities. IK solvers must detect and handle singularities, typically through Jacobian damping (adding a small regularization term to prevent numerical instability) or singularity avoidance constraints in the WBC QP.

---

## FAQ

**What is the difference between position IK and pose IK?**
Position IK computes joint angles to achieve only the end-effector's 3D position (x, y, z) — 3 constraints. Pose IK (also called full pose or 6-DOF IK) additionally constrains the end-effector's orientation (roll, pitch, yaw) — 6 constraints total. Full pose IK is required for manipulation tasks where the hand approach angle matters (inserting a screwdriver, pouring from a cup), while position-only IK suffices for tasks where orientation is unimportant.

**What is the "reachability workspace" and how does it affect task planning?**
The reachability workspace is the set of all end-effector poses (position + orientation) that the robot can achieve without violating joint limits or collisions. Not all poses within the robot's kinematic reach are achievable at all orientations — near the edges of the workspace, orientation flexibility decreases. Task planners must check that required end-effector poses are within the robot's reachability workspace before committing to a task execution plan.

**Does learning-based IK replace traditional solvers?**
Not yet for production use. Traditional IK solvers with good singularity handling are reliable and exact (within numerical precision). Learning-based IK can be faster for real-time applications but introduces approximation error and requires retraining when the robot's configuration changes. The most common deployment pattern is traditional IK for precision tasks and learning-based IK for real-time whole-body control where small position errors are acceptable.
