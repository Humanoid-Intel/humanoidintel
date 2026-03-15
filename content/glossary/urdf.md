---
term: "URDF"
slug: "urdf"
category: "software"
definition: "Unified Robot Description Format — an XML file format that describes a robot's physical structure including links, joints, mass properties, collision geometry, and visual appearance, serving as the universal standard for robot kinematics specification."
relatedTerms: ["inverse-kinematics", "sim-to-real-transfer", "whole-body-control", "degrees-of-freedom"]
---

URDF (Unified Robot Description Format) is the XML-based file format that describes a robot's complete physical model. Every robot in the ROS (Robot Operating System) ecosystem has a URDF — it is the lingua franca for expressing robot kinematics, dynamics, and geometry to simulators, planners, and controllers. Understanding URDF is essential for working with humanoid robot software, as it is the entry point for simulation, motion planning, and control.

## What a URDF Contains

A URDF file is structured as a kinematic tree (or chain) of links connected by joints:

**Links**: Rigid body segments of the robot. Each link specifies:
- **Inertial properties**: Mass, center of mass, inertia tensor. Required for dynamics simulation and whole-body control.
- **Visual geometry**: Mesh file (.stl or .dae) or primitive shape for rendering. Used in simulators and visualization tools like RViz.
- **Collision geometry**: Simplified mesh or primitive for collision detection. Often a simplified version of the visual mesh for computational efficiency.

**Joints**: Connections between links. Each joint specifies:
- **Type**: revolute (rotation around one axis), prismatic (translation along one axis), fixed (no movement), continuous (unbounded revolute), floating (6-DOF)
- **Parent and child links**: The kinematic relationship — which link is upstream and which downstream
- **Origin**: The 3D position and orientation of the joint in the parent link frame
- **Axis**: The joint rotation/translation axis (for revolute and prismatic joints)
- **Limits**: Minimum and maximum position, velocity, effort (torque/force)

A complete URDF for a humanoid like Figure 03 or Apollo contains hundreds of links and dozens of joints, plus references to dozens of mesh files for visual and collision geometry. The file size and complexity scale with the robot's DOF count.

## URDF in the Humanoid Software Stack

URDF serves multiple roles in the humanoid software ecosystem:

**Simulation**: Every major robot simulator (MuJoCo, NVIDIA Isaac Sim, Gazebo, PyBullet) loads URDF as its primary robot model format. The URDF provides the physical properties needed to simulate dynamics: joint positions, velocities, and torques are propagated through the kinematic tree using the inertial properties specified in the URDF.

**Motion planning**: Planning libraries (MoveIt, OMPL, Tesseract) use URDF collision geometry to check for self-collisions and collisions with the environment when planning motion paths. A motion plan that passes collision checking in the URDF's collision model is considered collision-free.

**Control**: Whole-body controllers and inverse kinematics solvers use URDF kinematics (joint types, axes, limits) and inertial properties (link masses, inertias) to compute joint torques required for desired motions. Inaccurate inertial properties in the URDF lead to poor whole-body control performance.

**Physical Intelligence π0.2 Embodiment Tokens**: Physical Intelligence's cross-embodiment VLA uses the robot's URDF to generate the "embodiment token" that conditions the model on the target robot's structure. This is an emerging use case where URDF serves as the structured representation of robot identity for AI model conditioning.

## URDF Limitations and Alternatives

URDF has several well-known limitations that have motivated alternatives:

**No closed kinematic loops**: URDF represents the robot as a tree structure, which cannot represent closed loops (like a robot holding a steering wheel with both hands, creating a loop through the object). Work-around uses mimic joints or separate URDF models.

**No deformable bodies**: URDF assumes rigid body dynamics. Tendon-driven actuators, soft robots, and flexible elements cannot be accurately represented.

**Limited actuator modeling**: URDF joint limits specify position, velocity, and effort limits but do not model actuator dynamics (motor inductance, friction, thermal limits). Advanced simulations supplement URDF with separate actuator model files.

**SDF (Simulation Description Format)**: Gazebo's alternative to URDF, supporting closed loops and more complete physics specification. More powerful but less universally supported.

**MJCF (MuJoCo Modeling Language)**: MuJoCo's native format, which supports soft bodies, contacts, and constraints not expressible in URDF. Many advanced research platforms are modeled in MJCF with URDF maintained for ROS compatibility.

## Practical Notes for Working with Humanoid URDFs

Most humanoid robot manufacturers publish their URDF (or can provide it to qualified customers and research partners). Unitree publishes URDFs for all its platforms in public GitHub repositories — a significant factor in research adoption. Figure AI and Apptronik provide URDFs to commercial partners under NDA. Boston Dynamics publishes URDFs for its platforms through its ROS packages.

Humanoid URDFs are large files (often 5-20 MB including mesh files) and require mesh preprocessing for efficient collision checking. MeshLab and Blender are commonly used to create simplified collision meshes from detailed visual meshes.

---

## FAQ

**How accurate do URDF inertial properties need to be for good control?**
For position-controlled robots (motors commanded to angles), inertial accuracy matters mainly for simulation. For torque-controlled robots (motors commanded to forces), inertial accuracy directly affects whole-body control performance — errors of 10%+ in link mass can cause observable degradation in balance control. Most manufacturers derive URDF inertials from CAD models, which can have 5-15% error versus physical hardware due to manufacturing tolerances and auxiliary components (wiring, thermal compound, fasteners) not modeled in CAD.

**Can URDF describe a full humanoid hand?**
Yes, though the result is complex. A 22-DOF hand like Figure 03's requires 22 joint definitions plus all associated links, adding hundreds of lines to the URDF. Mesh files for finger links are small but numerous. The hand portion of a humanoid URDF often accounts for more than half of the total file complexity due to its high DOF count relative to other robot segments.

**What tools are used to visualize and debug URDFs?**
RViz (ROS visualization tool) is the standard URDF viewer, allowing joint angles to be manipulated interactively to verify kinematics. MeshLab or Open3D can inspect individual mesh files. Python scripts using the urdfpy or yourdfpy libraries parse URDF programmatically for kinematics analysis. NVIDIA's URDF Inspector in Isaac Sim provides physics-correct dynamic visualization.
