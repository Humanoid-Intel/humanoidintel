---
term: "Backdrivability"
slug: "backdrivability"
category: "hardware"
definition: "The ability of a robot joint to be moved by external forces acting on the output side — that is, whether an external force can 'backtrack' through the transmission to displace the joint without the motor actively commanding it."
relatedTerms: ["harmonic-drive", "tendon-driven", "dexterous-manipulation", "whole-body-control"]
---

Backdrivability is one of the most important and least publicized properties in humanoid robot hardware. It determines whether a robot can passively comply with contact forces, whether it can be safely pushed by a human, whether it can perform contact-rich assembly tasks without breaking components, and whether a collision causes catastrophic damage or harmless deflection. Understanding backdrivability is essential for evaluating any humanoid robot for tasks involving human proximity or delicate contact.

## The Physics of Backdrivability

Backdrivability is fundamentally a question of transmission efficiency in reverse. In a robot joint with a motor and gearbox:

**Forward direction**: Motor torque → gearbox → joint output torque. A 100:1 gearbox amplifies motor torque by 100x, enabling a small motor to produce large joint forces. Efficiency is typically 75-90% in the forward direction.

**Backward (backdriving) direction**: External torque applied to the joint output → gearbox (reversed) → motor shaft. The external torque must overcome the gearbox's internal friction to backtrack through the mechanism. Efficiency in the reverse direction is typically much lower than forward, and for high-ratio gearboxes like harmonic drives, can be 20-40%.

A joint with 30% backdrivability efficiency absorbs 70% of any externally applied force as gearbox friction before it reaches the motor. The motor effectively has to exert 3x the external force to actively comply with it. This means:

1. **Collision safety**: A non-backdrivable robot arm is more dangerous in collision — the rigid joint transmits full impact force to whatever it contacts.
2. **Force transparency**: You cannot "feel" contact through a non-backdrivable joint using motor current alone — significant forces are masked by friction.
3. **Passive compliance**: A backdrivable robot arm falls naturally under gravity if unpowered; a non-backdrivable arm stays frozen in place (convenient for some applications, dangerous for others).

## Quantifying Backdrivability

Backdrivability is measured as the minimum torque required at the joint output to cause the joint to move when the motor is unpowered. A lower threshold indicates better backdrivability.

- **Harmonic drive (100:1)**: Backdriving threshold approximately 3-8 Nm — significant external force needed
- **Harmonic drive (50:1)**: Threshold approximately 1-3 Nm — somewhat better
- **Series Elastic Actuator**: Threshold approximately 0.5-2 Nm — passive spring compliance aids backdrivability
- **Quasi-direct-drive (8:1 planetary)**: Threshold approximately 0.1-0.5 Nm — excellent backdrivability
- **Direct drive (no gearbox)**: Threshold approximately 0.01-0.1 Nm — near-ideal backdrivability

## Backdrivability vs. Stiffness: The Core Tradeoff

The properties that make a joint backdrivable (low gear ratio, low friction) are exactly the properties that reduce its stiffness and ability to hold position under load. A joint with a 100:1 harmonic drive holds its position rigidly under a 50 Nm external load with near-zero position error. A direct-drive joint under the same load deflects substantially and requires active motor torque to maintain position.

This tradeoff manifests in robot design as a fundamental choice:

**High stiffness, low backdrivability**: Suitable for precise positioning tasks, structural applications, locomotion joints where stiffness provides stability. Most humanoid joints currently use this approach.

**Low stiffness, high backdrivability**: Suitable for contact-rich manipulation, human-robot interaction, compliant assembly. Series Elastic Actuators and quasi-direct-drive designs serve this need.

**Variable stiffness actuators (VSA)**: Research designs that can actively change stiffness from compliant to rigid, capturing both capabilities. Mechanically complex and heavier; not yet commercially deployed in humanoids.

## Which Robots Optimize for Backdrivability

**MIT Mini Cheetah / MIT Humanoid**: Quasi-direct-drive throughout. Exceptional backdrivability and force control, accepted position precision tradeoff. Design philosophy from Sangbae Kim's lab.

**Apptronik Apollo**: Series Elastic Actuators. Intermediate backdrivability enabling force-controlled assembly tasks; NASA heritage in compliant manipulation.

**Boston Dynamics Atlas Electric**: Not fully disclosed; believed to use a mix of high and low ratio joints optimized for each function.

**Most commercial humanoids (Figure, Unitree, Fourier)**: Harmonic drives throughout. Prioritize precision and structural stiffness over backdrivability; rely on dedicated force-torque sensors and software compliance rather than passive mechanical backdrivability.

The industry trend for premium manipulation capability is toward incorporating at least some backdrivable joints in the arm and wrist, while maintaining stiffer, non-backdrivable joints in the legs where stiffness aids locomotion stability.

---

## FAQ

**Can software compensate for poor backdrivability?**
Partially. Active compliance control — using motor current to estimate and cancel perceived contact forces — can create the impression of backdrivability. However, this approach is limited by sensor noise (motor current sensing is noisy), control bandwidth (limited to ~100 Hz for stable compliance control vs. passive compliance which is instantaneous), and actuator dynamics (the motor must physically overcome gearbox friction to produce compliance). Software compliance works well for slow, gentle contacts; it is insufficient for rapid impact absorption or delicate force-controlled insertion.

**Why do humanoid legs use non-backdrivable joints if backdrivability is good?**
Leg joints must support the robot's full weight in stance phase, approximately 60-90 kg of gravitational load. A backdrivable leg joint under this load would require continuous active motor torque to prevent collapse — extremely energy-inefficient and reducing battery life. Non-backdrivable leg joints hold position passively at zero motor current, dramatically reducing the energetic cost of standing. For locomotion efficiency, stiff legs are preferable. Only for manipulation tasks where the arm contacts objects or humans does backdrivability provide compelling benefits.

**Does backdrivability affect robot safety around humans?**
Significantly. ISO/TS 15066, the collaborative robot safety standard, specifies maximum allowable contact forces and pressures for human-robot coexistence. A backdrivable robot arm that deflects when it contacts a human transmits much lower peak forces than a stiff, non-backdrivable arm at the same velocity. OSHA's 2026 humanoid safety guidance references maximum contact forces consistent with ISO/TS 15066, creating regulatory pressure toward more backdrivable designs for collaborative deployments.
