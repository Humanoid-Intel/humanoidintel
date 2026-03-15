---
term: "End-Effector"
slug: "end-effector"
category: "hardware"
definition: "The terminal device attached to a robot arm that directly interacts with the environment — in humanoids, typically a multi-fingered hand, but may be a specialized gripper, tool, or sensor."
relatedTerms: ["dexterous-manipulation", "degrees-of-freedom", "inverse-kinematics", "proprioception"]
---

The end-effector is the part of a robot that does the work. Every other component of a robotic arm — motors, links, joints, controllers — exists to position and orient the end-effector correctly so it can interact with the world. For humanoid robots, the end-effector is almost always a hand (or hand-equivalent), because humanoids are designed to operate in environments built for human hands.

The choice of end-effector is the single most consequential decision in determining what a robot can actually do. A robot arm with perfect kinematics and infinite workspace is useless if its end-effector cannot grasp the target object.

## Types of End-Effectors in Humanoid Robotics

**Multi-fingered dexterous hands**: The archetype for humanoids. Designs range from 2-finger parallel grippers to 5-finger anthropomorphic hands with 22+ DOF. More DOF enables more complex manipulation but increases cost, weight, and failure probability.

**Parallel jaw grippers**: Two opposing jaws that open and close, typically pneumatically or electrically actuated. Simple, reliable, and widely used in industrial settings. Many collaborative robots ship with parallel jaw grippers as the default. For humanoids, parallel jaw grippers sacrifice generality for reliability — a valid tradeoff for constrained deployment environments.

**Suction cup/vacuum grippers**: Use vacuum pressure to adhere to flat or slightly curved surfaces. Highly effective for picking flat objects (boxes, PCBs, flat-pack items) but fail on porous, curved, or irregularly shaped objects. Amazon's robotic pick systems use a mix of suction and compliant jamming grippers.

**Adaptive/underactuated grippers**: Use fewer actuators than DOF, allowing the gripper to conformally close around objects. The Robotiq 2F-85 and Barrett Hand are prominent examples. Adaptive grippers provide some of the grasping versatility of dexterous hands with simpler actuation — often 1-2 motors driving 4-8 DOF through linkage or tendon coupling.

**Tool changers**: Mechanisms that allow the robot to swap end-effectors autonomously from a rack. Apptronik Apollo ships with a quick-release wrist mechanism enabling field-swappable end-effectors. This approach allows a single robot platform to switch between a dexterous hand for assembly, a suction gripper for box handling, and a specialized fixture for precision fastening.

## End-Effector Design Trade-offs

The central tension in end-effector design is **generality vs. reliability**:

A 22-DOF anthropomorphic hand can grasp and manipulate nearly any object a human can handle, but it has 22 joints that can fail, 22 actuators that can burn out, and a control problem of corresponding complexity. Mean time between failures (MTBF) for such hands in industrial service is currently measured in hundreds of hours rather than the thousands of hours required for cost-effective commercial deployment.

A 2-finger parallel jaw gripper has one joint (the opening distance), one actuator, and can be made very reliably. Its MTBF in industrial settings is 10,000+ hours. But it can only grasp objects within a specific size and shape range, and cannot perform in-hand reorientation.

Most commercial humanoid deployments in 2025-2026 are using moderate-DOF hands (6-14 DOF) that balance some dexterity with acceptable reliability. The engineering trajectory is toward higher DOF with improved reliability as materials, manufacturing tolerance, and control software mature.

## The Wrist: The End-Effector's Interface

The wrist joint(s) between the arm and end-effector are often underappreciated but critically important. Human wrists have 3 DOF (flexion/extension, radial/ulnar deviation, and pronation/supination), enabling the hand to approach objects from almost any angle. Many robot arms have only 1 or 2 wrist DOF, creating reachability constraints — orientations from which the robot cannot grasp even when its arm can reach the location.

Force-torque sensors at the wrist are increasingly standard on commercial humanoids. A wrist-mounted 6-axis F/T sensor provides the most useful single addition to a robot's force sensing capability, enabling contact detection, grasp quality monitoring, and compliant insertion for assembly.

---

## FAQ

**Can humanoid robots swap end-effectors automatically?**
Yes, several platforms support autonomous end-effector exchange. Apptronik Apollo's wrist design allows tool swaps from a rack without human intervention in 15-30 seconds. Universal Robots' ecosystem has popularized tool changers in collaborative robotics; the humanoid sector is adopting similar standards. The SCHUNK and ATI quick-change systems are compatible with several humanoid arm interfaces.

**What end-effector does Figure AI's Figure 03 use?**
Figure 03 uses Figure AI's proprietary anthropomorphic hand with 22 DOF, featuring 4 fingers and a thumb. The hand has silicone compliant fingerpads and per-fingertip force sensing. The wrist includes a 6-axis force-torque sensor. Unlike some competitors, Figure 03's hand is not designed for field-swapping — it is the primary end-effector for all deployments.

**How do end-effectors handle varying object sizes and shapes?**
Multi-fingered hands adapt through grasping planning algorithms that compute a stable grasp configuration given the object's estimated geometry (from depth cameras). Parallel jaw grippers adapt by opening to the appropriate width. Adaptive/underactuated grippers physically conform to the object's surface. The practical versatility of each design is ultimately determined by the training data and planning software, not just hardware capability — a 22-DOF hand with poor grasp planning may perform worse on novel objects than a simpler gripper with excellent planning.
