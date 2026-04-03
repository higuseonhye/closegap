# Closegap — Overview for reviewers, programs, and links

**Language:** English only.  
**Repository:** [github.com/higuseonhye/closegap](https://github.com/higuseonhye/closegap)  
**Last updated:** 2026-04-04

---

## What it is (one paragraph)

**Closegap** is a web app for pre-seed and seed founders who already have PMF-style signals but stall before **first paid revenue**. It assembles a **time-boxed campaign** in one flow: offer, scope, window, readiness checks, and a path to payment (e.g. Stripe Payment Link)—so setup friction does not kill the sell moment. It does **not** promise revenue or replace distribution; it **removes gaps** between offer, display, and checkout.

---

## Problem

Founders often lose momentum because landing copy, scope, dates, and payment live in **different tools** and “later” tasks. Closegap keeps them in **one workspace** with an honest **readiness** view before publish.

---

## Product vision (north star)

The long-term direction is a **single workflow toward traction**: from a sellable campaign through **first transaction**, then **repeat campaigns** and **light, truthful evidence**—not a separate “growth hacks” product. The current build is **phase A**: campaign + readiness + public page + external checkout. **Synced storage and accounts** are the next step so shared URLs work for any visitor. See [`FIRST_TRANSACTION_AND_TRACTION.md`](FIRST_TRANSACTION_AND_TRACTION.md) and [`PRD_AND_TECH_SPEC.md`](PRD_AND_TECH_SPEC.md) section 0.

---

## What ships today (MVP)

- **Dashboard** — create campaigns (stored in-browser for this build).
- **Campaign workspace** — pitch (offer + audience), price, window presets, scope, checkout URL, readiness panel, publish.
- **Public page** — `/c/{slug}` when status is **live** or **ended**; draft/ready show a “not published” state.
- **Stack** — Vite, React, TypeScript, Tailwind CSS; static deploy to Vercel-compatible hosts.

**Limitation:** Data is **localStorage** in the creator’s browser until a backend ships. Demos and dogfooding work; **buyers on another device** need **Phase B** (sync) for a fully shared story.

---

## Why this MVP is the right wedge

It implements the **smallest honest unit** of the north star: a **publishable sell loop**. Building traction dashboards or heavy PMF import **before** this loop would skip the core spine of the product.

---

## Documentation map

| Doc | Purpose |
|-----|---------|
| [`POSITIONING.md`](POSITIONING.md) | Copy, ICP, what we are / aren’t, north star (short) |
| [`PRD_AND_TECH_SPEC.md`](PRD_AND_TECH_SPEC.md) | Flows, data model, phased roadmap, MVP fitness vs north star |
| [`FIRST_TRANSACTION_AND_TRACTION.md`](FIRST_TRANSACTION_AND_TRACTION.md) | Transaction vs traction, “product only” stage, full north star |

---

## License

MIT — see repository root [`LICENSE`](../LICENSE).
