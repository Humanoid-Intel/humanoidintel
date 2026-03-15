---
title: "OSHA Issues First Humanoid Robot Workplace Safety Framework — What Manufacturers Need to Know"
slug: "osha-humanoid-robot-workplace-safety-framework"
date: "2026-01-10T10:00:00Z"
updated: "2026-01-10T10:00:00Z"
category: "policy"
tags: ["osha", "policy", "regulation", "safety", "compliance", "workplace"]
companies: ["Figure AI", "Agility Robotics", "Apptronik"]
robots: ["figure-02", "digit-v4", "apollo"]
excerpt: "OSHA's first humanoid-specific workplace safety guidance extends ISO/TS 15066 collaborative robot standards to bipedal platforms, with significant compliance implications."
featured: false
sources:
  - title: "OSHA Guidance Document: Humanoid Robots in General Industry"
    url: "https://osha.gov/guidance/humanoid-robots-2026"
  - title: "ISO/TS 15066:2016 — Robots and Robotic Devices"
    url: "https://iso.org/standard/62996.html"
---

The Occupational Safety and Health Administration published its first guidance document specifically addressing humanoid robots in general industry workplaces on January 8, 2026. The 47-page guidance, titled "Humanoid Robots in General Industry: Employer Obligations and Recommended Practices," does not create new regulations — OSHA guidance documents are not legally binding — but it establishes the agency's interpretive position on how existing General Duty Clause obligations apply to humanoid deployments, and it signals the regulatory framework that formal rulemaking would likely codify.

For companies currently deploying or evaluating humanoid robots, this document defines the floor of safety practice that OSHA inspectors will reference in any incident investigation.

## What the Guidance Covers

The guidance addresses four primary areas:

### 1. Hazard Identification and Risk Assessment

OSHA's guidance requires employers to conduct a formal risk assessment for each humanoid deployment using a methodology aligned with ISO 10218 (the industrial robot safety standard) and extended through ISO/TS 15066 (collaborative robot technical specification). The key requirement is that risk assessment must account for humanoid-specific hazards not present in fixed industrial robots:

- **Mobile pinch points**: Unlike fixed robots with defined envelopes, humanoids can walk, creating dynamic pinch hazard zones that change with locomotion
- **Dynamic payload transfer**: Humanoids carrying objects create variable CoM shifts that affect fall risk in ways that must be modeled per task
- **Fall energy**: A 60-70 kg humanoid falling from standing height releases approximately 600-700 joules of impact energy — equivalent to a significant industrial struck-by hazard

OSHA has adopted the ISO/TS 15066 framework for allowable contact force limits in collaborative zones (where humans and robots share space without physical barriers), setting maximum transient contact force at 280 N for the thorax contact zone and 130 N for the head. Current humanoid platforms operating in collaborative mode are expected to demonstrate compliance through either physical testing or validated simulation.

### 2. Operating Mode Requirements

The guidance establishes three required operating modes for humanoids working near human employees:

- **Collaborative mode**: Robot speed limited based on ISO/TS 15066 power-and-force limiting requirements; humans may be present in the robot's workspace without barriers
- **Monitored mode**: Robot operates at full speed but behind safety-rated light curtains or area scanners; humans may not enter workspace without triggering speed reduction
- **Isolated mode**: Full barrier guarding; equivalent to traditional industrial robot cell

Humanoid companies have generally designed for collaborative mode as their deployment target, given that the primary value proposition of humanoids is working in spaces designed for humans without infrastructure modification. OSHA's guidance effectively requires that collaborative mode operation be validated with safety integrity level (SIL) documentation — a requirement that adds compliance engineering cost.

### 3. Training Requirements

Employers must train employees who work near humanoids in:

- Emergency stop locations and procedures (all deployed platforms must have accessible e-stops; OSHA recommends minimum two per robot, labeled per ANSI Z535 standards)
- Interaction protocols — what employees may and may not ask humanoid robots to do during operation
- Incident reporting procedures
- Recognition of behavioral anomalies that indicate a malfunction

This training requirement is non-trivial for large deployments. A 500-unit deployment across a facility with 3-shift operations may require training 500+ employees — an onboarding cost that enterprise customers are now including in total cost of ownership calculations.

### 4. Incident Investigation and Reporting

OSHA's most significant new guidance addresses recordkeeping for humanoid robot incidents. Any incident resulting in a recordable injury (under existing 300-log requirements) must include documentation of:

- Robot operating mode at time of incident
- Last successfully executed task and time
- Sensor logs for 60 seconds preceding incident
- Software version and most recent policy update timestamp

This logging requirement effectively mandates that humanoid OEMs provide customers with tamper-evident, time-stamped sensor and behavioral logs accessible for post-incident forensic review. Companies without this capability built into their platform will face pressure from enterprise customers whose legal exposure depends on demonstrating proper log preservation.

## What Figure AI, Agility, and Apptronik Are Doing

Figure AI, Agility Robotics, and Apptronik have each publicly commented on the OSHA guidance:

**Figure AI** already requires customers to conduct pre-deployment risk assessments as a condition of its commercial agreements, and Figure 03 includes tamper-evident logging as a standard feature. Figure AI's VP of Safety Engineering characterized the guidance as "broadly consistent with our existing compliance framework."

**Agility Robotics**, whose Digit v4 deployments at Amazon represent the largest non-Tesla humanoid fleet, has the most to gain from regulatory clarity. Amazon's existing safety infrastructure (safety-rated area scanners, established robot safety protocols from Kiva/Proteus deployments) provides a baseline that the OSHA guidance validates. Agility's primary compliance work involves extending its risk assessment documentation to include mobile pinch point modeling, which was not explicitly addressed in its prior ISO 10218 submissions.

**Apptronik** notes that NASA-heritage safety engineering practices — specifically FMEA and fault tree analysis at component and system level — already exceed OSHA's documentation requirements in most categories. The new logging requirements are within Apollo's existing sensor and telemetry architecture; Apptronik is adding customer-facing log export tools to comply with the 60-second pre-incident log requirement.

## Liability Landscape

The guidance creates clarity but also new liability exposure. Prior to this document, an employer deploying a humanoid under the General Duty Clause faced uncertainty about what constituted an "adequate" safety program. The guidance provides a reasonably specific checklist — and implicitly, a standard against which incident investigators will measure employer conduct.

For humanoid OEMs, the guidance does not directly impose liability, but it creates product liability pressure: customers will increasingly require that platforms include the compliance-enabling features (collaborative mode force limiting, accessible e-stops, tamper-evident logging) as contractual terms, not optional add-ons.

---

## FAQ

**Is OSHA guidance legally binding?**
No. OSHA guidance documents interpret existing regulations but do not carry the force of law. However, OSHA inspectors use guidance to inform their assessment of General Duty Clause violations, and guidance documents are frequently cited in administrative law proceedings. Employers who deviate from guidance do so with the understanding that they must demonstrate an equivalent alternative protection, which increases legal risk.

**When is formal rulemaking expected?**
OSHA has included a humanoid robot safety rulemaking item in its regulatory agenda for FY2027. The typical ANPRM (Advanced Notice of Proposed Rulemaking) to final rule timeline is 3-5 years, suggesting binding regulations could be in place by 2030. The current guidance will likely form the backbone of any formal rule.

**Do these requirements apply to warehouse robots like Digit?**
Yes. OSHA's guidance covers all humanoid robots in general industry workplaces, regardless of the specific application. Amazon's existing safety infrastructure for Digit deployments (safety-rated area scanners, speed-limited collaborative zones) already addresses most requirements, but the new logging and training documentation requirements will require process updates.
