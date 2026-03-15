---
title: "Tendon-Driven vs. Harmonic Drive: The Actuator Battle Defining Humanoid Dexterity"
slug: "tendon-driven-vs-harmonic-drive-actuator-comparison"
date: "2026-01-15T10:00:00Z"
updated: "2026-01-15T10:00:00Z"
category: "deep-dive"
tags: ["actuators", "hardware", "tendon-driven", "harmonic-drive", "dexterity", "technical"]
companies: ["Figure AI", "Clone Robotics", "Apptronik", "Boston Dynamics"]
robots: ["clone-p1", "figure-03", "atlas-electric", "apollo"]
excerpt: "The choice of actuator architecture is the most consequential hardware decision in humanoid design. Here's a rigorous comparison of the leading approaches."
featured: false
sources:
  - title: "IEEE Transactions on Robotics: Actuator Design for Humanoids"
    url: "https://ieeexplore.ieee.org/document/actuator-humanoids-2025"
  - title: "Clone Robotics Myofiber Technical Whitepaper"
    url: "https://clonerobotics.com/technology/myofiber"
---

Actuator selection is the most consequential and least publicized design decision in humanoid robotics. The choice cascades through every metric that matters commercially — payload, precision, efficiency, backdrivability, noise, maintenance interval, and ultimately, unit cost. Yet most coverage of the humanoid sector focuses on software capability and valuation rather than the mechanical engineering decisions that determine whether a robot can physically execute the tasks its AI is trained for.

This analysis examines the four primary actuator architectures deployed in current humanoid platforms, with specific reference to where each approach excels, where it fails, and what it implies for the dexterity ceiling of the platforms that use it.

## Architecture 1: Harmonic Drive + Brushless DC Motor

**Used by**: Figure 02/03, Agility Digit v4, Unitree H1/H1 Pro, Fourier GR-2, most Chinese commercial humanoids

The dominant architecture in commercial humanoids pairs a brushless DC motor with a harmonic drive (also called strain wave gear) transmission. Harmonic drives are uniquely suited to robotics: they achieve gear ratios of 50:1 to 320:1 in an extremely compact form factor, with zero backlash and high torsional stiffness. A harmonic drive's three-component design (wave generator, flexspline, circular spline) has no parallel in conventional gearing for its combination of ratio, compactness, and precision.

**Strengths**:
- Zero backlash enables precise joint angle control (position error < 0.01°)
- High ratio enables small, light motors — reduces weight and cost
- Compact — entire actuator module fits inside a robot link
- Mature supply chain (Harmonic Drive AG, Nidec, other suppliers)

**Weaknesses**:
- **Low backdrivability**: A 100:1 harmonic drive has a backdrivability efficiency of 20-40%. This means the joint resists external forces — safe from a collision-absorption standpoint, but it prevents the robot from feeling external contact as easily, limiting fine manipulation tasks where compliant contact force control is needed.
- Flexspline fatigue: The flexspline (a thin-walled elastic gear) accumulates metal fatigue under cyclic loading. At high-frequency manipulation tasks, harmonic drives require replacement every 3,000-10,000 operating hours depending on loading conditions.
- Efficiency losses: At low speeds (relevant for slow manipulation), harmonic drive efficiency drops to 60-70%, generating heat and reducing battery endurance.

For warehouse logistics and structured assembly tasks — Figure AI's BMW deployment, Digit's Amazon deployment — harmonic drives are appropriate. The task requirements are predictable, forces are bounded, and the precision advantage outweighs the backdrivability limitation.

## Architecture 2: Series Elastic Actuators (SEA)

**Used by**: Apptronik Apollo, early Boston Dynamics Atlas (hydraulic-era learning legacy)

Series Elastic Actuators insert a calibrated spring element between the motor/gearbox output and the joint. The spring serves two functions: it passively absorbs impact forces (protecting the gearbox from shock damage), and it enables precise force measurement through spring deflection sensing. Force = spring stiffness × spring deflection, measured by high-resolution encoders on both sides of the spring.

**Strengths**:
- Force control accuracy: SEA force error of ±1 Nm is achievable vs. ±5-10 Nm for torque-estimated harmonic drives
- Impact tolerance: Spring absorbs shock loads that would damage rigid actuators
- Passive compliance: Makes physical human-robot interaction safer by default

**Weaknesses**:
- **Bandwidth limitation**: The spring introduces a resonant frequency that limits control bandwidth. Typical SEA bandwidth is 10-30 Hz — adequate for manipulation but insufficient for highly dynamic locomotion. This is why SEA-based platforms tend to be slower walkers.
- Weight penalty: Adding the spring element and dual encoder assembly increases actuator mass 15-30% vs. equivalent rigid actuators
- Nonlinear spring behavior: Real springs have stiffness that varies with deflection, complicating force estimation at extremes

Apollo's NASA heritage is relevant here: the Valkyrie robot and Apptronik's earlier HERo and DRACO platforms all use SEA, giving the team years of operational data on SEA failure modes, maintenance intervals, and control strategies. This institutional knowledge is genuinely valuable and difficult to replicate.

## Architecture 3: Hydraulic and Hydraulic-Electric Hybrid

**Used by**: Sanctuary AI Phoenix, historical Boston Dynamics Atlas (pre-2024)

Hydraulic actuation provides the highest force density of any actuation technology — hydraulic cylinders can produce thousands of Newtons in a very small package. For tasks requiring extreme payload or force, hydraulics have no serious rival.

**Strengths**:
- Unmatched force density: 5-10x higher than equivalent electric actuators by mass
- Natural backdrivability: Hydraulic valves can be controlled to provide impedance across a wide range
- Inherent shock tolerance: Fluid compliance absorbs impacts

**Weaknesses**:
- Fluid management: Hydraulic systems require seals, hoses, and reservoirs that introduce leak risk, maintenance burden, and weight
- Energy efficiency: Hydraulic systems waste energy generating heat in the fluid; total system efficiency is typically 30-50%
- Noise: Hydraulic pumps generate significant acoustic noise — relevant in co-located human-robot work environments
- Complexity: Proportional valves, accumulators, and pressure sensors add hundreds of components

Boston Dynamics retired hydraulic Atlas in April 2024 precisely because electric actuation has matured to the point where hydraulics' efficiency and complexity penalties outweigh their force density advantage for the task categories humanoids will perform. Sanctuary AI's hybrid Phoenix retains hydraulics for its high-payload arms while using electric actuation for legs — a pragmatic compromise acknowledging both the payload requirements of industrial tasks and the efficiency needs of mobile platforms.

## Architecture 4: Tendon-Driven (Myofiber / Cable-Drive)

**Used by**: Clone Robotics P1 (Myofiber), various research platforms (cable-drive)

Tendon-driven systems replicate biological musculoskeletal architecture: actuators (motors or artificial muscles) located in the robot's body drive joints through cables or tendons routed along the kinematic chain. Clone Robotics' Myofiber variant uses fluid-powered artificial muscles that contract when pressurized, directly mimicking skeletal muscle function.

**Strengths**:
- **Dexterity ceiling**: By routing multiple tendons through small joint cross-sections, tendon-driven designs can achieve far higher DOF in the hand than any motor-per-joint architecture. Clone P1's 206 DOF is unreachable for conventional designs.
- Natural compliance: Tendon systems have inherent elasticity that produces safe, human-like contact behavior
- Power-weight ratio: Muscle-like actuators can be located in the body mass (like human forearms driving the fingers), dramatically reducing hand weight

**Weaknesses**:
- **Complexity and reliability**: Managing 50+ tendons per hand, each with individual tension control, creates failure mode exposure that no team has yet solved at commercial scale
- Stiffness limitation: Tendons stretch under load, reducing position accuracy for tasks requiring precise placement
- Control difficulty: The Jacobian mapping from tendon tensions to joint torques is highly nonlinear and changes with joint configuration

Clone Robotics' Myofiber approach adds a further challenge: artificial muscle technology is still maturing. Cycle life, fatigue characteristics, and response bandwidth for hydraulic artificial muscles at joint forces relevant to manipulation are active research problems.

## Where the Field Is Heading

The consensus view among hardware engineers at leading humanoid companies is that no single actuator architecture wins universally. The emerging industry pattern for premium humanoids by 2027-2028 will likely be:

- **Legs**: High-ratio electric (harmonic or cycloidal) for efficiency and stiffness in locomotion
- **Torso and arms**: SEA or quasi-direct-drive for force control in manipulation
- **Hands**: Tendon-driven or miniaturized direct-drive for dexterity, with per-finger SEA for force sensing

The integration challenge of mixing actuator types within a single platform is not trivial — it requires modular software abstraction of the joint controller interface, something that frameworks like ROS 2 and proprietary whole-body controllers are beginning to address. The next major hardware milestone in humanoid dexterity will not be a new actuator type, but a multi-architecture platform that successfully integrates all three approaches in a manufacturable, maintainable system.

---

## FAQ

**Can harmonic drives be made backdrivable?**
Yes, to a degree. Lower gear ratios (30:1 vs. 100:1) improve backdrivability but sacrifice the compactness that makes harmonic drives attractive. Some companies combine low-ratio gears with Series Elastic elements to get reasonable backdrivability at acceptable compactness. This quasi-direct-drive approach (used by MIT's Mini Cheetah and adapted for humanoid joints) is an active area of development.

**Why don't more humanoids use tendon-driven hands?**
Reliability at commercial scale. Academic tendon-driven hands (the DLR Hand, Shadow Hand) have demonstrated the dexterity ceiling, but both require significant maintenance and skilled operation. For commercial deployment where maintenance intervals must be measured in months rather than hours, current tendon-driven reliability is insufficient. Clone Robotics' Myofiber is the most ambitious attempt to change this.

**What is the maintenance interval for a harmonic drive in a deployed humanoid?**
Under typical industrial manipulation loads (continuous operation, 4-8 hours/day), harmonic drive modules require inspection at approximately 2,000 hours and replacement at 5,000-8,000 hours. At 6 hours/day utilization, this implies a 2-3 year replacement interval per joint — an acceptable maintenance cost at current robot pricing but a significant fleet management consideration for large deployments.
