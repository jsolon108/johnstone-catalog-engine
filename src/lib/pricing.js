/* Client-side pricing access.
 *
 * Calls the Eclipse serverless function at /api/eclipse. If that route
 * is unavailable (e.g. running plain `vite dev` without `vercel dev`),
 * it falls back to a local simulation so the UI stays demoable.
 *
 * Pricing is fetched per Eclipse Product ID — never per branded model
 * number — so the same unbranded item appearing twice is priced once.
 */

export async function fetchEclipsePricing(productIds, customerId) {
  try {
    const res = await fetch("/api/eclipse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds, customerId }),
    });
    if (!res.ok) throw new Error(`Eclipse API ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[pricing] /api/eclipse unavailable — using local simulation:", err.message);
    return simulate(productIds, customerId);
  }
}

/* TEMPORARY — mirrors the stub in api/eclipse.js so the app works
 * under plain `vite dev`. Delete once the real ERP call is live and
 * the app always runs behind `vercel dev` / a real deployment. */
function simulate(productIds, customerId) {
  const map = {};
  productIds.forEach((id) => {
    const seed = [...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0);
    const base = 250 + (seed % 3400);
    const contract = customerId ? 1 - ((seed % 9) + 3) / 100 : 1;
    map[id] = { price: Math.round(base * contract), onHand: seed % 7 === 0 ? 0 : (seed % 40) + 3 };
  });
  return map;
}
