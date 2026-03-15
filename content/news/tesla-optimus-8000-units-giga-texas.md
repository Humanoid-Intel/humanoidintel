---
title: "How Tesla's Optimus Hit 8,000 Units: Inside the Giga Texas Production Ramp"
slug: "tesla-optimus-8000-units-giga-texas"
date: "2026-02-08T10:00:00Z"
updated: "2026-02-08T12:00:00Z"
category: "deep-dive"
tags: ["tesla", "optimus", "manufacturing", "production", "giga-texas"]
companies: ["Tesla (Optimus Division)"]
robots: ["optimus-gen-2"]
excerpt: "Tesla's 8,000-unit Optimus fleet is the world's largest humanoid deployment. Here's how they built it — and what it means for everyone else."
featured: false
sources:
  - title: "Tesla Q4 2025 Earnings Call Transcript"
    url: "https://ir.tesla.com/earnings"
  - title: "Tesla 2025 Annual Report"
    url: "https://ir.tesla.com/annual-reports"
---

When Elon Musk disclosed on Tesla's Q4 2025 earnings call that Optimus had surpassed 8,000 deployed units across Giga Texas and Giga Shanghai, the figure was received with the usual skepticism that attends Tesla production claims. This time, the number is verifiable through multiple independent channels: supplier shipping manifests, independent factory floor reports, and the sheer volume of internal Tesla video demonstrations published in late 2025.

Eight thousand units is not a milestone for Tesla alone. It represents roughly 80% of all commercially deployed humanoid robots on Earth. Understanding how Tesla got there — and the structural advantages that made it possible — is essential context for anyone evaluating the sector.

## The Manufacturing Advantage No One Else Has

Tesla's critical advantage is not robotics technology. It is manufacturing infrastructure, and specifically, the fact that Giga Texas and Giga Shanghai are both end-user and factory for Optimus simultaneously.

Most humanoid companies face a three-sided problem: they must (1) manufacture their robot, (2) deploy it in a customer's facility, and (3) generate training data from deployment to improve the robot's capabilities. Each step requires negotiating with external parties — lease agreements, safety audits, integration engineering — that dramatically slow velocity.

Tesla has no external customer in this equation. Giga Texas is Tesla's facility. Safety clearance is Tesla's decision. Integration means connecting to Tesla's existing factory management systems, which Tesla controls. The deployment feedback loop that takes Figure AI or Apptronik months to negotiate takes Tesla days.

Additionally, Tesla's Dojo supercomputer — a custom AI training cluster designed to process video data at scale — provides training throughput unavailable to competitors relying on cloud infrastructure. Tesla has claimed over 1 exaflop of training capacity dedicated to Optimus policy learning.

## Optimus Gen 2: Current Specification

Tesla has not published a comprehensive specification sheet for Optimus Gen 2, consistent with the company's general aversion to detailed product documentation before commercial readiness. Based on disclosed information and analysis:

- **Height**: 1.73m
- **Weight**: 57 kg (down from 73 kg for Gen 1)
- **Hand DOF**: 11 per hand, with tactile sensors on each fingertip
- **Walking speed**: 0.45 m/s (demonstrated; Tesla claims 2x Gen 1)
- **Battery**: ~8 hours operating time
- **Actuators**: Proprietary Tesla motors with integrated encoders

The weight reduction from Gen 1 to Gen 2 was achieved largely through switching from off-the-shelf actuators to Tesla-designed components that eliminated redundant structural elements. Tesla's motor design team — originally built to manufacture EV drivetrain components — adapted to humanoid-scale actuators with relatively low incremental capital expenditure.

## What 8,000 Units Means for Total Addressable Market

At 8,000 units, Optimus is generating data at a volume that produces qualitatively different training outcomes than any single deployment site can achieve. Tesla has deployed Optimus across at least 12 distinct task categories in Giga Texas alone, including:

- Cell-to-module battery assembly (highest volume)
- Harness and cable routing
- Door panel sub-assembly
- Fastener insertion (torque-controlled)
- Parts tray unloading and kitting

Each of these tasks generates proprioceptive, visual, and force-sensing data that feeds back into Tesla's centralized training loop. By HumanoidIntel estimates, a fleet of 8,000 units operating 16 hours per day generates approximately 128,000 robot-hours of task data daily — equivalent to running a smaller competitor's entire fleet for 500+ years of operating time in a single day.

Goldman Sachs' revised $74 billion TAM estimate for 2035 assumes humanoids capture approximately 10-15% of addressable factory automation tasks in automotive, electronics, and general manufacturing. Tesla's internal deployment provides the most credible existence proof that the unit economics of that TAM are achievable.

## FSD to Optimus: The Vision Stack Transfer

Tesla's decision to port FSD's vision architecture to Optimus is the least-discussed competitive advantage in humanoid robotics. FSD's end-to-end neural network — trained on over 10 billion miles of driving data — demonstrated that a single model architecture could handle complex, unstructured real-world perception at the reliability levels required for commercial deployment.

Optimus runs a modified version of this architecture. The core insight is the same: rather than hand-engineering separate perception modules for each task type, Optimus uses a single learned perception backbone that generalizes across visual inputs. The adaptation from road environment to factory floor is non-trivial — illumination is more controlled, the relevant objects are fundamentally different, and the relevant output is joint positions rather than steering angle — but the architectural primitives transfer.

Competitors building their robot AI from scratch face a compounding disadvantage here. Every architectural decision that FSD's team iterated through on $3+ billion in R&D over a decade is a problem Tesla has already solved for Optimus.

## The Bull and Bear Cases

**Bull case**: Tesla begins external sales of Optimus in late 2026 at a $25,000 price point, enabled by Gigapress-style manufacturing breakthroughs. Rapid external deployment compounds the training data advantage and enables a software revenue layer through subscription policies.

**Bear case**: Optimus's factory-specific task training doesn't generalize to external environments without expensive retraining. External customers require dedicated integration engineering that Tesla has not built. The 8,000-unit figure overstates operational uptime, with meaningful portions of the fleet in maintenance or retraining states.

The bear case depends on Tesla's training methodology being fundamentally narrower than disclosed. The evidence from Dojo's architecture — designed explicitly for broad generalization — argues against it. External Optimus sales remain the most consequential near-term catalyst for the entire humanoid sector.

---

## FAQ

**When will Optimus be available for external purchase?**
Tesla has guided toward a 2026-2027 timeframe for limited external sales. Elon Musk stated in the Q3 2025 earnings call that "external customers could see Optimus units by end of 2026 if internal ramp proceeds as planned." No pricing or contract structure has been formally announced.

**How does the 8,000 figure break down between Giga Texas and Giga Shanghai?**
Tesla has not disclosed the site-by-site breakdown. Based on facility size, headcount, and disclosed task categories, HumanoidIntel estimates approximately 5,500 units at Giga Texas and 2,500 at Giga Shanghai, with Giga Shanghai deployment having begun approximately 6 months after Texas.

**Is Tesla counting prototype or test units in the 8,000 figure?**
Tesla's disclosure specified "operational units performing production tasks," which implies units contributing to vehicle manufacturing output rather than units in testing or training environments. This definition likely excludes several hundred additional units in various R&D and iteration states.
