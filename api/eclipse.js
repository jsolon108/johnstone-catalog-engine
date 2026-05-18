/* Eclipse ERP pricing — Vercel serverless function.
 *
 *   POST /api/eclipse
 *   body:  { productIds: string[], customerId?: string }
 *   200:   { [productId]: { price: number, onHand: number } }
 *
 * ─────────────────────────────────────────────────────────────────
 * ▼▼▼ THIS IS A STUB ▼▼▼
 * getPricing() currently returns deterministic SIMULATED pricing so
 * the app runs end-to-end before the ERP is connected. Replace the
 * body of getPricing() with a real call to the Eclipse API.
 *
 * When wiring the real call, reuse the proven patterns from the
 * mini-split selector (jsolon108/mini-split-selector):
 *   - the umQuantity / quantity request shape
 *   - the global 419 session re-auth + retry interceptor
 *
 * Keep Eclipse credentials in Vercel Environment Variables
 * (Project Settings → Environment Variables), never in the repo.
 * ─────────────────────────────────────────────────────────────────
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { productIds = [], customerId = null } = req.body || {};

  if (!Array.isArray(productIds)) {
    res.status(400).json({ error: "productIds must be an array" });
    return;
  }

  try {
    const pricing = await getPricing(productIds, customerId);
    res.status(200).json(pricing);
  } catch (err) {
    console.error("[eclipse] pricing failed:", err);
    res.status(502).json({ error: "Eclipse pricing unavailable" });
  }
}

async function getPricing(productIds, customerId) {
  // ─── STUB: deterministic simulated pricing ──────────────────────
  // Remove this block once the real call below is implemented.
  const map = {};
  productIds.forEach((id) => {
    const seed = [...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0);
    const base = 250 + (seed % 3400);
    const contract = customerId ? 1 - ((seed % 9) + 3) / 100 : 1;
    map[id] = {
      price: Math.round(base * contract),
      onHand: seed % 7 === 0 ? 0 : (seed % 40) + 3,
    };
  });
  return map;

  // ─── REAL CALL (to implement) ───────────────────────────────────
  // const ECLIPSE_BASE = process.env.ECLIPSE_API_BASE;
  // const token = await getEclipseSession();          // session auth
  //
  // const resp = await fetch(`${ECLIPSE_BASE}/pricing`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${token}`,
  //   },
  //   body: JSON.stringify({
  //     customerId,
  //     products: productIds.map((id) => ({
  //       productId: id,
  //       umQuantity: 1,
  //       quantity: 1,            // see mini-split selector for the
  //     })),                      // exact umQuantity/quantity shape
  //   }),
  // });
  //
  // if (resp.status === 419) {
  //   // session expired — re-auth and retry once (419 interceptor)
  // }
  //
  // const data = await resp.json();
  // return normalizeToMap(data);  // -> { [productId]: { price, onHand } }
}
