---
title: "Figure AI Raises $1.5B Series C at $6.7B Valuation as Figure 03 Enters Mass Production"
slug: "figure-ai-series-c-figure-03-production"
date: "2026-02-10T10:00:00Z"
updated: "2026-02-10T14:30:00Z"
category: "breaking"
tags: ["figure-ai", "funding", "figure-03", "series-c", "manufacturing"]
companies: ["Figure AI"]
robots: ["figure-03", "figure-02"]
excerpt: "Figure AI closes $1.5B Series C at a $6.7B valuation, the largest single raise in humanoid history, as Figure 03 enters mass production."
featured: true
sources:
  - title: "Figure AI Press Release"
    url: "https://figure.ai/news/series-c"
  - title: "Bloomberg: Figure AI Raises $1.5 Billion"
    url: "https://bloomberg.com/news/figure-ai-raises-1-5-billion"
---

Figure AI has closed a $1.5 billion Series C at a $6.7 billion post-money valuation, the largest single fundraise in humanoid robotics history and a 2.6x step-up from the company's $2.6 billion valuation established in its February 2024 Series B. The round was led by Samsung Securities, with participation from LG Technology Ventures, BMW iVentures, and existing investors including OpenAI, Microsoft, and Nvidia.

The timing is deliberate: Figure 03, the company's successor to the commercially deployed Figure 02, has simultaneously entered mass production at Figure's Sunnyvale manufacturing facility, with initial shipments already dispatched to BMW Group facilities in Spartanburg, South Carolina.

## What Changed Between Figure 02 and Figure 03

Figure 03 is not an incremental update. The platform's hand redesign — from 16 to 22 degrees of freedom per hand, with a new tendon-routing architecture for the index and middle fingers — represents a significant leap in fine manipulation capability. In benchmark testing conducted by Figure's autonomy team, Figure 03 achieved a 34% improvement on multi-step assembly tasks compared to Figure 02 running equivalent policies.

Key specification changes:

| Spec | Figure 02 | Figure 03 |
|------|-----------|-----------|
| Weight | 60 kg | 57 kg |
| Payload | 20 kg | 25 kg |
| Hand DOF | 16/hand | 22/hand |
| Battery | 5 hrs | 6 hrs |
| Whole-body DOF | 44 | 50 |

The weight reduction from 60 to 57 kg, despite a more capable platform, was achieved through redesigned carbon-fiber structural components and a more efficient battery pack geometry. The 25% payload increase significantly expands the addressable task set in automotive manufacturing.

## Helix VLA Integration

Figure 03 ships with Figure's Helix vision-language-action model integrated at the firmware level — a departure from Figure 02, which required separate inference hardware. Helix processes multi-camera RGB and depth inputs with proprioception data through a transformer architecture, outputting 50-dimensional joint position targets at 50Hz. In internal evaluations, Helix-powered Figure 03 units demonstrated the ability to begin executing novel tasks from natural-language instructions within minutes of arriving at a new workstation, with zero prior teleoperation demonstration.

## BMW Expansion: From One Plant to Four

The BMW Group partnership, which began with a pilot at Spartanburg in mid-2024, has expanded to three additional plants as of Q1 2026. The newly added facilities include BMW's Regensburg plant in Germany, the Dingolfing component manufacturing hub, and the San Luis Potosí assembly plant in Mexico. Across all sites, Figure 03 units are performing body-in-white operations, seat assembly, and component inspection tasks.

BMW's participation as a strategic investor in this round — through BMW iVentures — formalizes what was already a deep commercial relationship. BMW's CFO cited "quantifiable productivity improvement and meaningful reduction in ergonomic injury incidents" in publicly available statements regarding the Spartanburg deployment.

## What the $6.7B Valuation Signals for the Sector

Figure's $6.7 billion valuation places it at roughly 9x its 2024 annualized hardware revenue run rate, by HumanoidIntel estimates based on deployment unit counts and per-unit economics. This multiple is aggressive for a hardware company but defensible if the market accepts the emerging precedent of pricing humanoid companies on a software-plus-hardware revenue model.

For comparison:
- **Boston Dynamics** was acquired by Hyundai in 2021 at approximately $1.1B, with a commercialized quadruped product (Spot) generating meaningful SaaS revenue.
- **Agility Robotics** is valued at approximately $500M following its Amazon-led Series B.
- **Apptronik** reached approximately $1.5B post its $350M Series A.

Figure's multiple reflects three things: its lead position in commercial automotive deployment, Helix's potential to generate software licensing revenue independent of hardware sales, and the strategic value attributed to its investor roster, which spans AI, semiconductor, automotive, and consumer electronics sectors.

The $4.2 billion in capital raised across all humanoid companies in 2025 has effectively been anchored by Figure. If Figure 03 production scales to the 1,000 units annually targeted for 2026, it would make Figure the largest humanoid robot manufacturer in the Western world by unit output — a distinction currently held by Tesla on a global basis.

---

## FAQ

**What is Figure 03's commercial availability?**
Figure 03 is available under Figure's Robotics-as-a-Service model and direct purchase agreements. Initial production capacity is allocated to BMW Group and undisclosed additional automotive OEM customers. Figure has not published a list price for Figure 03, but per-unit economics in deployment contracts are estimated at $150,000–$200,000 per robot for initial runs, declining with scale.

**How does Figure 03 compare to Tesla Optimus on specs?**
Tesla Optimus Gen 2 and Figure 03 are broadly comparable in height, weight, and payload. Figure 03 has a meaningful advantage in hand dexterity (22 vs. 11 DOF/hand). Tesla Optimus benefits from a training data advantage — 8,000 deployed units versus Figure's estimated 200+ — that translates to more mature manipulation policies for tasks within Tesla's factory environment.

**What will the $1.5B fund?**
Figure has disclosed three priority uses: (1) expanding Sunnyvale manufacturing to a dedicated facility capable of 5,000+ units per year by 2027, (2) Helix model development including multi-task and multi-robot coordination capabilities, and (3) international commercial expansion in automotive, electronics assembly, and logistics verticals.
