# Closegap — PRD & technical specification

**Last updated:** 2026-04-03  
**Companion docs:** [`POSITIONING.md`](POSITIONING.md) (copy, ICP, decision log)

This document turns positioning into **build-ready** scope: flows, screens, data, integrations, readiness rules, and **explicit reuse** of your existing repositories.

---

## 1. Purpose & scope

### 1.1 Problem statement

Pre-seed and seed teams often have **PMF signals and conversations** but lose momentum before **first paid revenue** because campaign surface, scope clarity, and payment path are split across tools and “someday” tasks.

### 1.2 Product goal (MVP)

Deliver a **single, time-boxed campaign** that assembles:

1. A **public landing** (offer, window, audience framing).
2. A **scope / terms surface** (what’s included, price, dates).
3. A **payment block** (checkout or payment link), with a **readiness gate** that shows what is still missing.

Software **does not** guarantee a buyer’s yes; it **removes setup gaps** between offer, display, and payment.

### 1.3 Non-goals (MVP)

| Out of scope for MVP | Rationale |
|----------------------|-----------|
| Full CRM, pipeline automation, enterprise procurement | ICP is founder-speed; avoid scope creep |
| Legal advice or contract generation as “truth” | Frame as templates + user responsibility; link disclaimers |
| Guaranteed revenue or lead gen | Aligns with [`POSITIONING.md`](POSITIONING.md) honesty |
| Heavy agent orchestration inside the critical payment path | Reliability over demo complexity; optional AI is sidecar |

### 1.4 Success metrics (suggested)

- **Activation:** user completes minimum inputs and reaches “readiness” or knowingly publishes with warnings.
- **Time-to-ready:** median time from start to all green readiness checks (cohort by week).
- **Publish:** shareable URL created; optional Stripe/Lemon link present.
- **Signal quality (optional):** PMF summary imported or linked without breaking the core flow.

---

## 2. Personas

| Persona | Needs | Closegap response |
|---------|--------|-------------------|
| **Solo founder** | Fast, low ceremony, no enterprise setup | Minimal fields, one campaign focus, local-first option |
| **Seed team (2–5)** | Shared link, consistent story | Account/team later; MVP can be single-user + export |
| **Builder already using PMF tools** | Bring interviews/signals into the same “sell moment” | Optional import / summary from PMF-style data |

---

## 3. Core user journeys

### 3.1 Journey A — Create campaign (happy path)

1. Land on marketing / app entry → **Start campaign**.
2. **Onboarding wizard** (minimum inputs): offer one-liner, price + currency, time window (start/end or duration), audience one-liner, contact / brand name (optional logo URL later).
3. System generates **draft**: landing section + scope section + payment placeholder.
4. **Readiness panel** lists blockers (e.g. payment not linked, dates incomplete).
5. User connects **payment** (or pastes approved link) and fixes blockers until green or accepts “publish with warnings.”
6. **Publish** → public URL(s): `/c/{slug}` (and optional custom domain later).

### 3.2 Journey B — Optional PMF / interview signal

1. From campaign workspace → **Add signals**.
2. Import: paste transcripts, upload JSON, or **link** to external tool output (see §7).
3. System shows **short signal summary** (problem intensity, willingness to pay, PMF tier) on the same campaign page or sub-section—**read-only** narrative, not a second product.

### 3.3 Journey C — Buyer (external)

1. Open shared URL → read offer + scope + window → CTA to pay / book / contact as configured.
2. No account required for buyer in MVP unless you add gated content later.

---

## 4. Screens & information architecture (MVP)

| Route / surface | Purpose |
|-----------------|--------|
| **Marketing** | Headline, value prop, CTA (existing `public/` can evolve). |
| **Dashboard / campaigns list** | List campaigns: name, status (draft / ready / live), last edited. |
| **Campaign workspace** | Tabs or sections: **Offer & window**, **Scope & terms**, **Payment**, **Readiness**, **Signals (optional)**. |
| **Public campaign page** | Single scroll or short multi-section: hero offer, scope, dates, payment CTA, optional signal summary. |
| **Settings (minimal)** | Profile display name, default currency, disconnect payment. |

**Deep links:** public page must be shareable; internal edit routes use campaign id.

---

## 5. Functional requirements

### 5.1 Onboarding inputs (minimum viable)

| Field | Required | Notes |
|-------|----------|--------|
| Offer one-liner | Yes | Single sentence; used in hero. |
| Price | Yes | Number + currency (ISO 4217). |
| Window | Yes | Start + end datetime **or** “X days from publish” with cap. |
| Audience one-liner | Yes | Who it’s for; ICP hint. |
| Internal campaign name | Yes | For dashboard list. |
| Brand / founder name | No | Public page footer. |
| Logo | No | URL or upload in v1.1. |

### 5.2 Generated artifacts

1. **Landing block:** headline (from offer), subhead (audience + window), primary CTA.
2. **Scope block:** bullet scope (user-editable template), price, what’s in / out (template).
3. **Payment block:** provider connection or external URL; display rules consistent with provider ToS.

### 5.3 Readiness gate (explicit rules)

Each item is **binary**; show **green / amber / red** with copy.

| Check | Green condition |
|-------|-----------------|
| **Offer** | Non-empty offer one-liner, length ≤ max (e.g. 280 chars). |
| **Price** | Valid number > 0, currency set. |
| **Window** | End > start (or valid relative window); not in the past for “live” without explicit “ended” state. |
| **Scope** | At least one scope line OR user acknowledges “minimal scope” checkbox. |
| **Payment** | Stripe Connect **or** valid external payment URL pattern + HTTPS + user confirmation. |
| **Publishable URL** | Slug unique; no collision. |

**Publish with warnings:** allowed if only non-critical items fail (product decision: default **off** for first paid; **on** for internal dogfood).

### 5.4 States

`draft` → `ready` (all required greens) → `live` (published) → `ended` (window passed) or `archived`.

### 5.5 Optional: signal summary

- **Inputs:** structured interview records (see [`pmf-finder`](https://github.com/higuseonhye/pmf-finder)-compatible fields) or pasted text.
- **Output:** 3–5 bullets + PMF tier **weak / medium / strong** using rules aligned with [`judgement-engine`](https://github.com/higuseonhye/judgement-engine) (deterministic layer); optional LLM polish behind feature flag.

---

## 6. Data model (conceptual)

Entities below are logical; implementation may use SQLite/Postgres/Supabase per stack choice.

### 6.1 `User` (if auth)

- `id`, `email`, `created_at`, `display_name`

### 6.2 `Campaign`

- `id`, `user_id` (nullable if anonymous draft with upgrade path)
- `slug` (unique), `title`, `status`
- `offer_one_liner`, `audience_one_liner`
- `price_cents`, `currency`
- `window_start`, `window_end`
- `scope_markdown` or `scope_lines` (JSON)
- `payment_provider` (`stripe` | `external_url` | `none`)
- `payment_ref` (Stripe account/link id or external URL)
- `settings` (JSON): warnings allowed, locale
- `created_at`, `updated_at`

### 6.3 `SignalImport` (optional)

- `id`, `campaign_id`, `source` (`paste` | `json` | `link`)
- `raw_payload` (encrypted at rest if sensitive)
- `summary_json` (bullets, pmf_tier, provenance)

### 6.4 `AuditEvent` (recommended for payment/publish)

- `id`, `campaign_id`, `type`, `payload` (non-PII), `at`

---

## 7. Integrations

### 7.1 Payments

- **Primary recommendation:** **Stripe** (Checkout or Payment Links + Connect if marketplace-style payouts). Aligns with common founder stack and webhook story.
- **Alternatives:** Lemon Squeezy, Gumroad—support **external URL** mode with manual verification.

### 7.2 Auth

- **MVP options:** magic link (Supabase/Clerk) or “no auth, local-only export” for fastest dogfood—pick one and document.

### 7.3 Email (later)

- Transactional: publish confirmation, window ending (Resend pattern from [`odd-runway`](https://github.com/higuseonhye/odd-runway)).

---

## 8. AI & automation boundaries

| Use | Allowed in MVP | Notes |
|-----|----------------|--------|
| Summarize transcripts into bullets | Optional | Feature-flagged; fallback to template |
| Generate scope from one-liner | Optional | User must edit; show as draft |
| Autonomous payment or legal commitments | **No** | Human-in-the-loop for anything binding |

Governance / evaluation patterns from **AgentOS** and **agent-eval** repos apply to **how** you test agents if you add them—not to the default checkout path.

---

## 9. Non-functional requirements

| Area | Target |
|------|--------|
| **Performance** | Public campaign TTFB acceptable on cold start (static or edge cache). |
| **Security** | HTTPS only; secrets in env; webhook signature verification for Stripe. |
| **Privacy** | Clear statement on transcript storage; minimize PII in logs. |
| **Accessibility** | Public page: semantic headings, button labels, contrast (iterate). |
| **i18n** | EN first; KO optional—[`pmf-finder`](https://github.com/higuseonhye/pmf-finder) / [`judgement-engine`](https://github.com/higuseonhye/judgement-engine) already model EN/KO toggles. |

---

## 10. Edge cases & failure modes

| Scenario | Behavior |
|----------|----------|
| User sets end date before start | Block save with inline error. |
| Slug collision | Suggest alternate slug. |
| Payment connection fails | Readiness red; show provider error code (sanitized). |
| Campaign ended | Public page shows “window ended” + optional CTA to contact. |
| Optional LLM unavailable | Degrade to deterministic summary or hide section. |
| Import malformed JSON | Reject with row-level errors; don’t crash workspace. |

---

## 11. Phased delivery

### Phase 0 — Skeleton (current repo)

Static positioning + placeholder UI.

### Phase 1 — MVP (ship)

Auth (or scoped token), campaign CRUD, generated public page, readiness gate, Stripe **or** external URL.

### Phase 2 — Signals

Import + [`judgement-engine`](https://github.com/higuseonhye/judgement-engine)-style analysis + short narrative on campaign.

### Phase 3 — Team & polish

Org, roles, custom domain, email reminders.

---

## 12. Repository reference matrix (reuse & alignment)

Use this table when deciding **library reuse**, **API contracts**, or **which product to deep-link**. Descriptions combine public READMEs and role-by-name; **verify each repo** before hard dependencies.

### 12.1 Direct product fit (PMF → sell moment)

| Repo | Role | How Closegap can use it |
|------|------|-------------------------|
| [pmf-finder](https://github.com/higuseonhye/pmf-finder) | ICP, leads, interviews, PMF score, transcripts, HTML report | **Signal import schema**, interview field alignment, optional embedded summary; same founder ICP. |
| [judgement-engine](https://github.com/higuseonhye/judgement-engine) | Rule-based analysis on interview records; `POST /api/analyze` | **Deterministic PMF tier + bullets** for Signal section; reuse types/API shape. |
| [deal-lens](https://github.com/higuseonhye/deal-lens) | VC Reliability Card: evidence, diligence questions, Prisma/SQLite | Pattern for **evidence-style** “why we’re ready” cards; not VC-focused copy—reuse **schema discipline** (scores, ledger). |

### 12.2 Decision, narrative, structure

| Repo | Role | How Closegap can use it |
|------|------|-------------------------|
| [deciscope](https://github.com/higuseonhye/deciscope) | Decision/diagnosis pipeline, verdict vocabulary | **Readiness as diagnosis**: map gates to structured “verdict” + prescription copy patterns. |
| [storyos](https://github.com/higuseonhye/storyos) | Multi-agent Express+Vite, streaming, optional AgentOS webhook | If you add **panel review** of campaign copy: reuse streaming shell; keep payment off-agent. |
| [stage](https://github.com/higuseonhye/stage) | (Verify in repo) | Staging/launch narrative—align naming with “campaign window.” |
| [structure-it](https://github.com/higuseonhye/structure-it) | (Verify in repo) | Templates for scope/offer structuring—import ideas when README available. |

### 12.3 AgentOS family (governance, HITL, audit)

| Repo | Role | How Closegap can use it |
|------|------|-------------------------|
| [odd-agentos](https://github.com/higuseonhye/odd-agentos) | CLI/runtime: workflows, replay, approval, System MRI, policies | **Internal** ops: optional workflow for “generate campaign draft → human approve → publish.” |
| [odd-live](https://github.com/higuseonhye/odd-live) | Docs + AgentOS debate extension | Governance experiments; not required for MVP checkout. |
| [agentos](https://github.com/higuseonhye/agentos) | Full stack: Celery, Redis, dashboard, envs, YAML workflows | Heavier **orchestration** reference if Closegap grows background jobs. |
| [agentos_mvp](https://github.com/higuseonhye/agentos_mvp) | (Verify) | Lighter MVP variant—compare to odd-agentos for scope. |
| [agentos_reference](https://github.com/higuseonhye/agentos_reference) | (Verify) | Reference patterns. |
| [agentos_master](https://github.com/higuseonhye/agentos_master) | (Verify) | Consolidated reference. |

### 12.4 Evaluation, reliability, risk (guardrails for AI features)

| Repo | Role | How Closegap can use it |
|------|------|-------------------------|
| [agent-eval-toolkit](https://github.com/higuseonhye/agent-eval-toolkit) | Offline eval: RAG, tool-use, multi-agent consensus | **QA** for any LLM-assisted copy/summary before ship. |
| [agenteval-quest-pack](https://github.com/higuseonhye/agenteval-quest-pack) | (Verify) | Extra scenarios for eval. |
| [agent-lens](https://github.com/higuseonhye/agent-lens) | Agent deployment risk analysis (v1–v3) | Risk framing for **optional** autonomous features. |
| [agent-accountability-eval](https://github.com/higuseonhye/agent-accountability-eval) | (Verify) | Accountability metrics—align with audit log story. |
| [worldsim-eval](https://github.com/higuseonhye/worldsim-eval) | (Verify) | Simulation—only if you simulate buyer scenarios (late phase). |
| [spk_balance](https://github.com/higuseonhye/spk_balance) | (Verify) | Balance/constraint experiments—niche unless you model negotiation. |

### 12.5 Infrastructure & LLM providers

| Repo | Role | How Closegap can use it |
|------|------|-------------------------|
| [ai-bedrock-chatbot](https://github.com/higuseonhye/ai-bedrock-chatbot) | Bedrock Claude + API Gateway + Lambda | **AWS-native** inference path if you standardize on Bedrock. |
| [aicivic-mvp](https://github.com/higuseonhye/aicivic-mvp) | Multi-role “AI company” agents, Streamlit | **Not** for checkout—pattern for role-separated prompts if you add internal copilots. |
| [mission-engine](https://github.com/higuseonhye/mission-engine) | Mission discovery, company blueprint | Optional **north-star** content marketing; not core MVP. |

### 12.6 Founder finance & runway (adjacent product)

| Repo | Role | How Closegap can use it |
|------|------|-------------------------|
| [odd-runway](https://github.com/higuseonhye/odd-runway) | Runway, burn, playbooks, investor email, Supabase optional | **Cross-sell** narrative: same ICP, different job (cash vs first sale). Link from dashboard later—not MVP scope. |

### 12.7 Research / RL (generally out of band)

| Repo | Role | How Closegap can use it |
|------|------|-------------------------|
| [zeroenv](https://github.com/higuseonhye/zeroenv) | RL framework, GridWorld, DQN/PPO | **No direct product dependency**; keep as research portfolio unless gamifying founder learning (unlikely MVP). |

---

## 13. Open decisions (to lock before build)

1. **Auth:** magic link vs OAuth vs anonymous-to-migrate.
2. **Backend:** serverless (Vercel) vs small Node API vs Python—align with team comfort and Stripe webhooks.
3. **Payment:** Stripe only vs Stripe + external URL from day one (spec assumes both).
4. **Data residency:** single region vs EU later.

---

## 14. Document history

| Date | Change |
|------|--------|
| 2026-04-03 | Initial PRD + tech spec + repo matrix |
