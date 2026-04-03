# Closegap — product & company copy (ready to use)

**Last updated:** 2026-04-03

---

## Names

| Role | Name |
|------|------|
| Product | **Closegap** |
| Company / umbrella brand | **ODD Playground** |

---

## Landing (English)

**Headline:** Close the gap to your first paid customer.

**Subhead:** Landing, scope, and checkout in one flow—so your first revenue doesn’t die in the setup.

**Primary CTA (examples):** Start your campaign · See what’s missing · Get ready to charge

---

## Elevator pitch (English, ~3 sentences)

**Closegap** helps pre-seed and seed founders turn PMF signals into a **time-boxed, sellable moment**: one clear offer, one scope, and one path to payment—so the only thing left is the customer’s yes. It doesn’t nag you with tasks; it **assembles** the storefront, the terms, and the checkout flow from a few inputs. **ODD Playground** builds tools for founders who need **revenue proof**, not another endless product polish cycle.

---

## About the company (English, short paragraph)

**ODD Playground** is a founder-led studio building software for people who ship under uncertainty. Our first product, **Closegap**, is for teams that already have conversations and signals but still can’t close the distance to a first paid customer or meaningful contract. We focus on **closing the gap**—from “maybe PMF” to “money moved”—without pretending software can replace judgment, pricing, or trust.

---

## One-line product definition

Software that reduces the distance to your first paid customer or first meaningful contract—by assembling campaign, scope, and payment in one flow for pre-seed and seed teams.

---

## What we are / aren’t

| We are | We aren’t |
|--------|-----------|
| Campaign + readiness + checkout assembly | A task nag / habit app |
| Honest: we remove setup blockers | A “guaranteed revenue” gimmick |
| Founder-speed: try fast, pay small | Enterprise procurement in a box |

---

## Internal build alignment (from existing work)

- **PMF / interviews / score:** `pmf-finder`-class flow (signals, ICP, interviews).
- **Judgment layer:** `judgement-engine`-class analysis on interview records where useful.
- **Deal surface:** one-page scope, price, window, payment link—minimal inputs.

---

## Decision log (why we chose this)

1. **ICP:** Pre-seed / seed founders—**day change** is “stop wandering on PMF alone for a month,” not a corporate budget line item.
2. **Truth:** Software cannot **create** a buyer’s yes; it can **remove gaps** between offer, display, and payment.
3. **Center product:** **Closegap** naming matches the headline; **pmf-finder** is the strongest existing fit for the “PMF confusion” half.
4. **Impression:** Prefer **readiness checklist** (nothing missing) over **fake revenue guarantees**.
5. **Shape:** **Campaign / showcase** (time-boxed), not offline pop-up logistics.
6. **Company name:** **ODD Playground** keeps continuity with existing repos and brand; product stays **Closegap**.

---

## Next implementation steps (when you build)

Detailed flows, fields, readiness rules, integrations, and **repository reuse** are in **[`PRD_AND_TECH_SPEC.md`](PRD_AND_TECH_SPEC.md)**.

1. Onboarding: collect **minimum inputs** (offer one-liner, price, window, audience).
2. Generate **landing + scope page + payment block** from templates.
3. **Readiness gate:** blockers highlighted until green (payment linked, scope visible, dates set).
4. Optional: import PMF notes / interviews → short “signal summary” on the same campaign.
