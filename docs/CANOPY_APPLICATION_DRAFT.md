# Canopy application — draft answers (Closegap / ODD Playground)

**Language:** English (for the form).  
**Last updated:** 2026-04-03  
**Source material:** [`APPLICATION_OVERVIEW.md`](APPLICATION_OVERVIEW.md), [`POSITIONING.md`](POSITIONING.md), [`PRD_AND_TECH_SPEC.md`](PRD_AND_TECH_SPEC.md), [`FIRST_TRANSACTION_AND_TRACTION.md`](FIRST_TRANSACTION_AND_TRACTION.md).

**How to use:** Copy each block into the Canopy form. Replace bracketed items (e.g. videos, student/funding, program dates) with your real answers. Record **intro** and **demo** videos before submitting.

---

## Basics

**What’s your name?**  
SEONHYE GU

**Email**  
higuseonhye@gmail.com

**Where are you based?**  
Seoul, South Korea

**Are you applying solo or with a team?**  
Solo

**Would you like to have a seat on campus?**  
*[Confirm against the current Canopy / Founders, Inc. dates and your travel. Only choose in-person if you can be there for the program window and will cover flight and lodging.]*

---

## Videos

**Drop a 30–60 second intro video (Loom or YouTube, unlisted is fine)**  
*[Record and paste your URL here. Suggested outline:]*

- Who you are (name, based in Seoul, building under **ODD Playground**).  
- **Closegap** — one flow for pre-seed/seed founders: offer, scope, time window, readiness, and a path to payment so first revenue doesn’t die in the setup.  
- Why Canopy — ship alongside people at the same intensity; push Closegap to a **deployed, shareable** milestone by the program end.

**Placeholder:** `[YOUR_LOOM_OR_YOUTUBE_URL]`

**Product demo (Loom or YouTube — phone video is fine)**  
*[Walk through: home → new campaign → pitch / price / window → readiness → publish → open public `/c/...` page. Use the deployed Vercel URL if you have one; otherwise local dev is fine with a short note.]*

**Placeholder:** `[YOUR_DEMO_VIDEO_URL]`

---

## Track & product

**Which track best fits what you’re building?**  
Software / AI

**What are you building right now? (one line — be concrete)**  
A web app that assembles a time-boxed founder campaign—offer, scope, window, readiness, and checkout—in one flow so the first paid customer isn’t blocked by scattered tools.

**Company name**  
ODD Playground  
*(Product name: **Closegap**.)*

**What does it do, and who is it for?**  
Closegap is for **pre-seed and seed founders** who already have PMF-style conversations or signals but stall before **first paid revenue** because landing, scope, dates, and payment live in different places. The product puts them in **one workspace**: you define the offer and audience, price and window, scope, and a payment link (e.g. Stripe Payment Link), see a **readiness** panel for what’s missing, then **publish** a public URL. It does **not** guarantee revenue or replace distribution—it **removes setup gaps** between offer, display, and checkout.

The long-term direction is a **single workflow toward traction**: first meaningful transaction, then repeat campaigns and **honest evidence**—not a fake “growth” dashboard. **Phase A (today)** is campaign + readiness + public page + external checkout, **local-first** in the browser. **Phase B** is accounts and **server-backed storage** so `/c/{slug}` is real for **any visitor**—documented in-repo as the next unlock, not a different product.

**Link to your product / project**  
https://github.com/higuseonhye/closegap

**One-pager for reviewers (optional second link)**  
https://github.com/higuseonhye/closegap/blob/master/docs/APPLICATION_OVERVIEW.md

---

## Background

**What is the coolest (technical) thing you’ve built?**  
I’ve shipped multiple **founder-facing tools** end-to-end—PMF interview flows, judgment/analysis layers, agent-orchestration experiments—across my GitHub portfolio. On **Closegap** specifically: a **readiness-gated** campaign flow (Vite, React, TypeScript, Tailwind) from draft to **live** public page with external checkout, with clear boundaries in the product docs (no fake revenue promises). The repo includes **Vercel-oriented deploy** (`vercel.json` SPA rewrites) and an honest MVP fitness section in the PRD. Portfolio: https://github.com/higuseonhye

**What are you the top 1% in the world at?**  
*[Edit to something true to you—examples:]* Shipping **full-stack MVPs** from zero to usable UI quickly; or **iterating in public** across many repos; or a specific skill with **evidence** (links, tags, shipped work). I’ll point reviewers to **GitHub activity** and shipped projects as proof.

**Can you personally build and ship the core product without outside help?**  
Yes

**GitHub / personal site / portfolio**  
https://github.com/higuseonhye

**Do you have users?**  
*[Choose honestly. If Closegap has no external paying users yet:]* No — the product is in **early implementation**; I’m focused on a **deployed** URL, **dogfooding**, and **first paying customer** for the product or for a packaged offer using Closegap.

---

## Program fit

**What do you want to ship by May 22?**  
*[Adjust the deadline to match the current cohort if the program dates differ.]*

A **deployed** Closegap on a public host (e.g. Vercel via the README deploy path) with an **end-to-end path** strangers can try: create a campaign → pass readiness (or publish with explicit warnings) → **live public URL** → optional real checkout link. **Accounts + server-backed storage** started or shipped so `/c/{slug}` works for **visitors on any device**, not only the creator’s browser—today’s MVP uses **localStorage**, which is documented as Phase **A**; Phase **B** is the sync unlock called out in [`PRD_AND_TECH_SPEC.md`](PRD_AND_TECH_SPEC.md) §0.

What should exist on the last day that doesn’t fully exist today: a **credible shareable product URL**, clearer **onboarding** for first-time visitors, and **progress on Phase B** so the story matches how real founders will share links—not another slide deck.

**Curious — any other ideas?**  
I maintain a **portfolio of related experiments** (PMF tooling, agent governance, evaluation)—some may connect to Closegap later as **signal context** on the same campaign. The program focus stays **Closegap** as the wedge.

**Are you a student?**  
*[Yes / No — fill in.]*

**Have you raised any funding?**  
*[Yes / No — fill in. If yes, one line at your comfort level.]*

**LinkedIn**  
linkedin.com/in/seonhyegu

**Twitter / X**  
x.com/seonhyegu

**What made you decide to apply?**  
I’ve been building alone at high intensity and want to be around **people shipping at the same pace**. Canopy’s **ship-by-a-deadline** culture matches how I work: Closegap already has a **clear MVP spine** and public docs; I want the push to get it **in front of real founders** with a **deployed, credible URL**—not to polish in isolation.

**How did you hear about Founders, Inc?**  
*[Fill in—content, X, event, or a friend.]*

**Did someone refer you? List their full name.**  
Hubert Thieblot

---

## Checklist before submit

- [ ] Replace both video placeholders with real Loom/YouTube links (unlisted OK).  
- [ ] Confirm **campus** option matches your travel reality and **current** program dates.  
- [ ] Set **student** and **funding** accurately.  
- [ ] Complete “How did you hear about Founders, Inc?” with your true source.  
- [ ] Deploy Closegap (Vercel or similar) so the **repo + live URL** story matches “ship by [program end].”  
- [ ] Re-read [`APPLICATION_OVERVIEW.md`](APPLICATION_OVERVIEW.md) so form answers match the one-pager word-for-word on scope and limitations.
