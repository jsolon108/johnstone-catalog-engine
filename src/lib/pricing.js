/* Client-side pricing access.
 *
 * Eclipse prices by catalog (model) number, but the rest of the app
 * works in Product IDs. So this sends the API a list of
 *   { pid, catalogNumber }
 * pairs and gets back a map keyed by Product ID:
 *   { [pid]: { price, onHand } }
 *
 * Because models that share a Product ID price identically, any one
 * model number per Product ID is enough — the caller picks one.
 *
 * Falls back to a local simulation when /api/eclipse is unreachable
 * (e.g. plain `vite dev` without `vercel dev`) so the UI stays demoable.
 */

export async function fetchEclipsePricing(items, customerId) {
  try {
    const res = await fetch("/api/eclipse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, customerId }),
    });
    if (!res.ok) throw new Error(`Eclipse API ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[pricing] /api/eclipse unavailable — using local simulation:", err.message);
    return simulate(items, customerId);
  }
}

/* TEMPORARY — local simulation so the app works under plain `vite dev`.
 * Delete once the app always runs against a real deployment. */
function simulate(items, customerId) {
  const map = {};
  items.forEach(({ pid }) => {
    const seed = [...String(pid)].reduce((a, c) => a + c.charCodeAt(0), 0);
    const base = 250 + (seed % 3400);
    const contract = customerId ? 1 - ((seed % 9) + 3) / 100 : 1;
    map[pid] = { price: Math.round(base * contract), onHand: seed % 7 === 0 ? 0 : (seed % 40) + 3 };
  });
  return map;
}