---
term: "Gait Cycle"
slug: "gait-cycle"
category: "hardware"
definition: "The complete sequence of leg movements from one foot contact to the next contact of the same foot, comprising stance phase (foot on ground) and swing phase (foot in air), which defines the rhythmic pattern of bipedal locomotion."
relatedTerms: ["whole-body-control", "proprioception", "inverse-kinematics", "degrees-of-freedom"]
---

The gait cycle is the fundamental unit of analysis for bipedal locomotion. Understanding gait cycles is essential for understanding why humanoid walking is difficult, what metrics matter for locomotion performance, and how different robots compare in their movement quality and efficiency.

## Gait Cycle Phases

A complete human walking gait cycle spans from one heel strike to the next heel strike of the same foot — approximately 1-1.3 seconds at normal walking speed. It divides into two phases:

**Stance phase** (~60% of the gait cycle): The foot is in contact with the ground. The leg provides support, propulsion, and balance. Subdivided into:
- Loading response: Absorbing impact at heel strike, weight transfer to the newly planted foot
- Mid-stance: Single support, body's center of mass vaults over the stance foot
- Terminal stance: Body center of mass moves ahead of the stance foot, weight shifts to forefoot

**Swing phase** (~40% of the gait cycle): The foot is in the air. The leg advances forward to prepare for the next stance. Subdivided into:
- Initial swing: Foot clearance from the ground, knee flexion
- Mid-swing: Forward limb advancement
- Terminal swing: Limb deceleration, foot positioning for heel strike

At walking speeds, both feet are simultaneously on the ground (double support) briefly at the transition between swing and stance. At running speeds, both feet are simultaneously in the air (float phase), and there is no double support phase — which is why running is harder to control than walking.

## Why Bipedal Gait Is Hard for Robots

Humans are "dynamically stable" walkers: we are technically falling forward during walking and use each step to catch ourselves. This constant controlled fall is highly energy-efficient (humans use 0.8 J/kg/m to walk — among the most efficient bipedal animals) but requires continuous real-time balance control.

Early humanoid robots used "statically stable" gait: always maintaining the center of mass above the support polygon, moving so slowly that falling is never a risk. This is extremely safe but extremely slow and unnatural. The ZMP (Zero Moment Point) criterion — ensuring the center of pressure at the foot never exits the support polygon — was the dominant design constraint for bipedal locomotion for 20 years.

Modern humanoids use dynamic, human-analogous gaits enabled by model predictive control and learned locomotion policies. Key advances:

**Centroidal Momentum Control**: Reasons about the robot's total linear and angular momentum rather than point-mass ZMP approximations. Captures the effect of swinging arms and rotating trunk on balance, enabling more human-like coordinated whole-body movement.

**Contact-implicit trajectory optimization**: Plans motions without specifying when and where contact occurs — the optimizer discovers the contact schedule. This enables discovering non-obvious locomotion strategies (like using hands to brace during recovery from perturbations).

**Learned locomotion policies**: Reinforcement learning in simulation has produced locomotion controllers that are more robust and efficient than hand-designed controllers. ETH Zurich's ANYmal team and MIT's Cheetah team demonstrated this first for quadrupeds; the approach has transferred to bipeds, with Unitree H1's 3.3 m/s walking record achieved with a learned policy.

## Gait Metrics That Matter for Humanoid Deployment

**Walking speed**: Most commercial humanoids walk at 0.5-1.5 m/s. Normal human walking is 1.4 m/s; fast walking is 1.8-2.0 m/s. For factory floor applications, 0.5-1.0 m/s is generally adequate. Speed records are dominated by research platforms: Unitree H1 at 3.3 m/s, Tiangong at sustained speeds completing a half-marathon.

**Cost of Transport (CoT)**: The dimensionless energy efficiency metric for locomotion. CoT = E / (m × g × d), where E is energy used, m is mass, g is gravity, and d is distance traveled. Humans achieve CoT ≈ 0.2 walking; most current humanoids achieve CoT 0.5-2.0, indicating 2.5-10x less efficient than humans. Energy efficiency directly affects battery life and operating costs.

**Step recovery**: The ability to maintain balance when disturbed by external pushes. Tested by impulse force applied to the torso; measured by maximum disturbance force recoverable without falling. Boston Dynamics Atlas recovers from 120 N impulse forces; most commercial humanoids handle 40-80 N.

**Terrain capability**: Ability to handle stairs, slopes, uneven surfaces, and compliant surfaces (foam, gravel). Most commercial deployments are on flat factory floors, limiting practical terrain requirements. Navigation versatility determines addressable deployment environments.

---

## FAQ

**What is the difference between walking and running for robots?**
Walking has a period of double support (both feet on the ground) and no aerial phase. Running has an aerial phase (both feet off the ground) and no double support. Running requires significantly higher joint torques, faster control loops, and more aggressive impact absorption at landing. Most commercial humanoids are designed for walking speeds only; running capability exists in research platforms (MIT Cheetah Mini, older hydraulic Atlas) but is not required for current industrial applications.

**How do humanoid locomotion controllers handle stairs?**
Stair climbing requires foot placement planning (knowing where to place the foot on each step) combined with higher-authority joint torques and appropriate weight shift strategies. Foot placement planning uses exteroceptive sensors (depth cameras, LIDAR) to estimate stair geometry, then generates a foot placement plan consistent with the robot's kinematic constraints. Most commercial humanoids can navigate stairs at reduced speed; full stair reliability in unstructured environments remains an active engineering challenge.

**How does walking efficiency affect battery life?**
Energy consumption during locomotion accounts for approximately 40-60% of a humanoid's total power draw, with manipulation and computation consuming the remainder. A robot with CoT of 1.0 (5x less efficient than a human) will drain its battery approximately 5x faster during walking than an equivalent-mass human would. At a typical 5kg humanoid torso payload and 500W total system power, locomotion at normal speed consumes approximately 150-200W. Improving CoT from 1.0 to 0.4 extends battery life by approximately 30% for walk-heavy deployments.
