---
term: "Imitation Learning"
slug: "imitation-learning"
category: "ai"
definition: "A machine learning approach where a robot learns to perform tasks by observing and replicating demonstrations provided by a human expert, rather than through explicit programming or trial-and-error reinforcement."
relatedTerms: ["vision-language-action-model", "zero-shot-generalization", "sim-to-real-transfer"]
---

Imitation learning (IL) is the primary method by which humanoid robots currently acquire manipulation skills. Rather than writing code that explicitly specifies how to grasp a cup, an engineer teleoperates the robot to perform the grasp while recording all sensor data, and a neural network learns the mapping from sensor inputs to motor commands from those recordings. The robot learns to imitate the demonstrated behavior.

The appeal of imitation learning for humanoids is that it leverages human expertise directly. Complex tasks that would take months to encode in traditional robotics programming — folding a shirt, assembling a mechanical component, preparing food — can be demonstrated in hours by a human teleoperator and learned by the robot from those demonstrations. This is why imitation learning has become the dominant learning paradigm for commercial humanoid deployments.

## Data Collection Methods

**Teleoperation**: A human operator controls the robot remotely using a motion capture suit, VR controllers, specialized input devices, or kinesthetic teaching (physically guiding the robot's arms). The robot records its joint angles, velocities, and camera observations during these demonstrations. Teleoperation produces data directly on the target robot in the target environment — the highest quality data for deployment — but is slow and expensive to collect.

**Human video demonstration**: The robot watches human video performing the task and learns to replicate it. Challenges include morphological mismatch (human hands and robot hands are different) and the need to infer 3D actions from 2D video. Recent work using retargeting algorithms to map human motions to robot kinematics is making this more practical.

**Kinesthetic teaching**: A human physically moves the robot's arms through the demonstration while the robot records the motion. This is the simplest data collection method but is limited to slower tasks (cannot capture fast human motion) and requires physical access to the robot.

**Puppet or exoskeleton systems**: The human wears an exoskeleton or operates a puppet system that maps their motions to the robot at scale. Figure AI, Apptronik, and most commercial humanoid companies use custom teleoperation systems for data collection, often involving VR controllers with haptic feedback.

## Key Algorithms

**Behavioral Cloning (BC)**: The simplest IL algorithm. Train a neural network to predict the demonstration action given the current observation via supervised learning. Works well when demonstration data is plentiful and the task is single-mode (one right way to do it). Fails under distribution shift — when the robot encounters a state not seen in demonstrations, it has no guidance on what to do.

**DAgger (Dataset Aggregation)**: Addresses BC's distribution shift problem by having the human expert correct the robot's policy in states the robot actually encounters during deployment. Iteratively refines the policy by collecting corrections, but requires interactive human involvement.

**Diffusion Policy**: Uses a diffusion model as the action head, learning to generate actions by iteratively denoising random noise conditioned on the current observation. Captures multimodal action distributions (multiple valid ways to grasp the same object) that BC misses. Currently the most popular algorithm for dexterous manipulation; used in π0, Helix (Figure AI), and most leading commercial systems.

**ACT (Action Chunking with Transformers)**: Predicts sequences of future actions (chunks) rather than single actions, which reduces error accumulation. Combined with temporal ensembling for smooth execution. Developed at Stanford; widely used in research and commercial settings.

## Data Scale Requirements

The amount of demonstration data needed for reliable task learning is one of the most practically important questions in robot learning:

- **Simple pick-and-place** (one object, fixed location): 50-200 demonstrations
- **Pick-and-place with variation** (multiple objects, multiple locations): 200-500 demonstrations
- **Dexterous manipulation** (grasping small objects, compliant insertion): 500-2,000 demonstrations
- **Long-horizon tasks** (multi-step assembly, food preparation): 2,000-10,000 demonstrations

Foundation model approaches (VLAs pre-trained on diverse datasets) significantly reduce these requirements through zero-shot and few-shot generalization, as discussed in the zero-shot-generalization entry.

## Industrial Data Collection Infrastructure

At commercial scale, data collection for imitation learning requires significant infrastructure. Physical Intelligence, Figure AI, and Agibot (China's most data-centric humanoid company) operate dedicated data collection facilities with multiple teleoperated robots collecting demonstrations continuously. Physical Intelligence's 10,000 robot-hour dataset for π0.2 training represents approximately 12 months of continuous operation by a fleet of 5-10 teleoperated robots.

The bottleneck is human operator throughput, not robot throughput. Skilled teleoperators who can produce high-quality manipulation demonstrations are scarce. This has driven interest in automation of data collection — using scripted environments, generative data synthesis, and cross-embodiment transfer to reduce dependence on live teleoperation.

---

## FAQ

**How does imitation learning differ from reinforcement learning for robotics?**
Reinforcement learning (RL) learns from reward signals through trial and error — the robot attempts a task, receives a reward for success, and gradually improves. RL can discover superhuman strategies but requires enormous amounts of experience and a reliable reward function. Imitation learning learns from human demonstrations and is much more data-efficient but is bounded by the quality of the demonstrations. Modern robot learning systems often combine both: IL for initial policy acquisition, RL for fine-tuning and edge case improvement.

**What prevents imitation-learned policies from generalizing to new environments?**
Imitation-learned policies trained on demonstrations from a specific environment (lighting, background, object instances) often fail when deployed in environments with different visual appearance. This is the distribution shift problem. Solutions include data augmentation during training (randomly perturbing images), domain randomization, and foundation model pre-training that provides robustness through diverse training exposure. Commercial deployments address this by collecting demonstrations in the actual deployment environment or by using VLA foundation models with strong pre-training.

**How many teleoperators does a typical humanoid company employ for data collection?**
Company disclosures are limited, but estimates based on data volume targets suggest: Physical Intelligence 30-50 teleoperators, Figure AI 20-40, Agility Robotics 10-20, Agibot (China) 100+ teleoperators. Chinese companies have a cost advantage in teleoperation data collection given lower labor costs, which contributes to the competitive data accumulation strategies seen in companies like Agibot.
