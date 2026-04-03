# Public GitHub repo — sharing with programs (e.g. Canopy)

**Last updated:** 2026-04-04  
**Language:** English only.

---

## Is it OK to link this repository on an application?

**Yes.** Linking a **public GitHub repository** for a product-in-progress is **normal** for accelerators, fellowships, and early-stage programs. Reviewers expect **work in progress**, README notes, and technical docs. A clear repo plus honest limitations (e.g. localStorage until sync) reads as **transparent**, not weak—as long as the code builds and the story matches what you claim.

---

## What third parties (reviewers) usually care about

| They look for | This repo |
|---------------|-----------|
| **Clarity** — what you are building and for whom | [`APPLICATION_OVERVIEW.md`](APPLICATION_OVERVIEW.md), [`POSITIONING.md`](POSITIONING.md) |
| **Execution** — something runs | `npm run build`; Vite/React app in `src/` |
| **Judgment** — scope boundaries, no fake guarantees | Positioning “what we aren’t”; readiness concept |
| **Honesty** — known limits | README + docs mention localStorage; roadmap in PRD |

They do **not** need a polished enterprise product. They need a **credible line of sight** from problem → approach → what exists today.

---

## Should you delete “unnecessary” content?

**Default: do not delete core docs** unless something is wrong or embarrassing. Long PRDs and internal matrices can look **dense**, but they also signal **depth** and **planning**. Optional cleanup if you want a **minimal public face**:

| Content | Keep / trim |
|---------|-------------|
| **README** | Keep; it is the front door. |
| **`APPLICATION_OVERVIEW.md`** | Keep; short link for forms. |
| **`POSITIONING.md`**, **`PRD_AND_TECH_SPEC.md`** | Keep unless you want a slimmer repo—then you could **move** very long sections to a `docs/internal/` branch or separate private notes (not required). |
| **Repository matrix (PRD §12)** | Internal mapping to your other repos—**fine to keep** as portfolio; if it feels noisy, you could trim to a **short “Related work”** list later. |
| **Decision logs** | Valuable; keep. |

**Never commit:** API keys, `.env` with secrets, customer PII, or unpublished financial data. This repo uses `.gitignore` for `.env`; keep it that way.

---

## If you want one link for the application form

Use:

- **Repository:** `https://github.com/higuseonhye/closegap`  
- **Optional one-pager for humans:** [`docs/APPLICATION_OVERVIEW.md`](APPLICATION_OVERVIEW.md) (raw or GitHub-rendered URL)

Example rendered overview URL (GitHub):

`https://github.com/higuseonhye/closegap/blob/master/docs/APPLICATION_OVERVIEW.md`

---

## Summary

- Linking this repo to **Canopy** (or similar) is **appropriate** if the product story matches your answers.  
- **No** requirement to strip docs for “professionalism”—clarity and honesty matter more.  
- **Optional** trim only if *you* feel the repo is too busy; start from [`APPLICATION_OVERVIEW.md`](APPLICATION_OVERVIEW.md) as the single narrative for forms.
