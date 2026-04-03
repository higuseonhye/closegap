# Closegap

**Close the gap to your first paid customer.**

Landing, scope, and checkout in one flow—so your first revenue doesn’t die in the setup.

---

## What it is

**Closegap** helps pre-seed and seed founders turn PMF signals into a **time-boxed, sellable moment**: one clear offer, one scope, and one path to payment—so the only thing left is the customer’s yes.

Built by **[ODD Playground](https://github.com/higuseonhye)**.

## Status

Early stage — product implementation in progress.

- [`docs/APPLICATION_OVERVIEW.md`](docs/APPLICATION_OVERVIEW.md) — **single-page summary** (English) for applications and reviewers  
- [`docs/POSITIONING.md`](docs/POSITIONING.md) — positioning, copy, decision log  
- [`docs/PRD_AND_TECH_SPEC.md`](docs/PRD_AND_TECH_SPEC.md) — PRD, flows, data model, readiness rules, and reuse map for existing repos  
- [`docs/FIRST_TRANSACTION_AND_TRACTION.md`](docs/FIRST_TRANSACTION_AND_TRACTION.md) — first transaction vs traction, north star, “product only” stage  

## Deploy (recommended next step)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhiguseonhye%2Fclosegap&project-name=closegap&repository-name=closegap)

1. Import the repo (link above) or connect **GitHub → New Project →** this repository.  
2. **Framework preset:** Vite (or “Other” with **Build command:** `npm run build`, **Output directory:** `dist`).  
3. Deploy. The SPA uses [`vercel.json`](vercel.json) rewrites so client routes work.

**Important:** Campaigns are stored in **localStorage in each browser**. A deployed URL is ideal for **the marketing shell**, **your own workflow**, and **screen-shared demos**. **Buyers on another device** will not see your draft data until **server-side sync** exists (see the doc above). Plan backend or hosted persistence when you need **shareable live campaigns** for strangers.

## Development

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`). Campaigns are stored in **localStorage** in this browser.

```bash
npm run build
```

Produces static output in `dist/`. For SPA routing on hosts like Vercel, see [`vercel.json`](vercel.json).

## License

MIT — see [LICENSE](LICENSE).
