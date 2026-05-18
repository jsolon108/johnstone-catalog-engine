# Johnstone Supply — Catalog Engine

Equipment catalog builder for Johnstone Supply NY/CT. Curate a product
catalog, render it as a branded web page and PDF, with **live pricing
pulled from the Eclipse ERP** at view time.

Replaces the static Pricebook Digital catalogs — pricing never goes
stale because nothing is baked at generation time.

## How it works

Three concerns are kept deliberately separate:

| Concern              | Changes        | Owned by              |
| -------------------- | -------------- | --------------------- |
| Catalog definition   | Slowly         | This tool (Build tab) |
| Pricing & stock      | Constantly     | Eclipse ERP           |
| Presentation/branding| Rarely         | This tool (template)  |

A catalog product stores only a **model number**. The Eclipse
**Product ID** is resolved from the cross-reference, and pricing is
fetched per Product ID. Because one Product ID is the canonical
*unbranded* item, the same physical unit sold under several brands
resolves to one ID and is priced once, consistently.

## Project structure

```
johnstone-catalog-engine/
├── api/
│   └── eclipse.js          Serverless fn — Eclipse pricing (STUB)
├── src/
│   ├── App.jsx             Root: holds catalog + xref state
│   ├── main.jsx            Entry point
│   ├── index.css           Tailwind + print styles
│   ├── components/
│   │   ├── TopBar.jsx
│   │   ├── Logo.jsx
│   │   ├── Builder.jsx     Build tab — curate products & branding
│   │   ├── XRef.jsx        Cross-Ref tab — model → Product ID lookup
│   │   ├── Preview.jsx     Customer View — branded render + PDF
│   │   └── ui.jsx          Shared Panel / Field / Stat
│   ├── lib/
│   │   ├── xref.js         buildIndex / resolve
│   │   ├── pricing.js      fetchEclipsePricing (calls /api/eclipse)
│   │   └── util.js
│   └── data/
│       ├── seed.js         Sample catalog
│       └── xrefSeed.js     Sample cross-reference rows
└── package.json
```

## Run locally

```bash
npm install
npm run dev          # UI only — pricing uses a local simulation
```

To exercise the real serverless function (`/api/eclipse`) locally:

```bash
npm i -g vercel
vercel dev           # runs the API routes too
```

`npm run dev` alone still works fully — `lib/pricing.js` falls back to
a local simulation when `/api/eclipse` isn't reachable.

## Deploy

Import the repo into a new **Vercel** project. Vercel auto-detects Vite
and serves the `api/` folder as serverless functions — no config
needed. Every push to `main` deploys.

Eclipse credentials go in **Vercel → Project Settings → Environment
Variables**, never in the repo.

## Roadmap

**Phase 1 — this scaffold.** Builder, cross-reference, branded web +
PDF render. Pricing simulated. Catalog state in memory.

**Phase 2 — live Eclipse pricing.** Replace the stub in
`api/eclipse.js#getPricing()` with the real ERP call. Reuse the
`umQuantity`/`quantity` request shape and the 419 re-auth interceptor
from the mini-split selector.

**Phase 3 — persistence (Supabase).** Move the catalog definition into
a `catalogs` table so each catalog gets a stable, shareable URL.
Required before customers can self-serve.

**Phase 4 — customer self-serve.** Public read-only route
`/c/{catalogId}` that loads the definition and fetches that customer's
contract pricing. Builder stays internal-only.

**Later — xref sync.** The `.xlsx` import works today; eventually sync
the cross-reference straight from Eclipse on a schedule so it never
drifts. The AHRI matching tool's data can also feed system pairings.

## Notes

- The Johnstone Supply logo is **not** bundled. Upload the official
  file on the Build tab; a plain wordmark stands in until then.
- `api/eclipse.js` and `lib/pricing.js` both contain a small simulated
  pricing block. Both are temporary — remove once Eclipse is wired.
