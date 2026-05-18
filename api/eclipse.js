/* Eclipse ERP pricing — Vercel serverless function.
 *
 *   POST /api/eclipse
 *   body:  { items: [{ pid, catalogNumber }], customerId?: string }
 *   200:   { [pid]: { price: number|null, onHand: number } }
 *
 * Eclipse prices by CATALOG NUMBER (the model number). Results are
 * keyed back to the Eclipse Product ID so the catalog can de-duplicate
 * items that share a Product ID — confirmed to price identically, so
 * any one model number under a Product ID is sufficient.
 *
 * Auth: a dedicated Eclipse service account. Credentials come from
 * Vercel environment variables and never reach the browser:
 *   ECLIPSE_USER         service-account username
 *   ECLIPSE_PASSWORD     service-account password
 *   ECLIPSE_PRICE_BRANCH optional pricing branch (default "FARM")
 *
 * Reuses the proven Eclipse patterns from the mini-split selector:
 * keep-alive agent, /Sessions login, and re-auth on an expired session.
 */

const https = require("https");

const ECLIPSE_BASE = "https://api.johnstonenyct.com:5000";
const PRICE_BRANCH = process.env.ECLIPSE_PRICE_BRANCH || "FARM";

// Reuse TCP connections across Eclipse API calls.
const eclipseAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 20,
  maxFreeSockets: 5,
  timeout: 15000,
});
const eclipseFetch = (url, opts = {}) =>
  fetch(url, {
    ...opts,
    agent: eclipseAgent,
    headers: { Connection: "keep-alive", ...(opts.headers || {}) },
  });

// Bosch system parts are catalogued in Eclipse without the BMS500- prefix.
function formatCatalogNumber(model) {
  return model && model.startsWith("BMS500-")
    ? model.replace("BMS500-", "")
    : model;
}

/* ── Service-account session ─────────────────────────────────────────
 * Cached at module scope so warm lambda invocations skip re-login. */
let cachedToken = null;

async function createSession() {
  const username = process.env.ECLIPSE_USER;
  const password = process.env.ECLIPSE_PASSWORD;
  if (!username || !password) {
    throw new Error("ECLIPSE_USER / ECLIPSE_PASSWORD environment variables are not set");
  }
  const r = await eclipseFetch(`${ECLIPSE_BASE}/Sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error(`Eclipse login failed: ${r.status}`);
  const data = await r.json();
  return data.sessionToken;
}

async function getToken() {
  if (!cachedToken) cachedToken = await createSession();
  return cachedToken;
}

// Eclipse GET with one automatic re-auth + retry on an expired session
// (Eclipse signals this as 419 or 401 depending on the endpoint).
async function authedGet(url) {
  let token = await getToken();
  let r = await eclipseFetch(url, {
    headers: { Accept: "application/json", sessionToken: token },
  });
  if (r.status === 419 || r.status === 401) {
    cachedToken = null;
    token = await getToken();
    r = await eclipseFetch(url, {
      headers: { Accept: "application/json", sessionToken: token },
    });
  }
  return r;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { items = [], customerId = null } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(200).json({});
  }

  try {
    const pricing = await getPricing(items, customerId);
    return res.status(200).json(pricing);
  } catch (err) {
    console.error("[eclipse] pricing failed:", err);
    return res.status(502).json({ error: "Eclipse pricing unavailable" });
  }
}

async function getPricing(items, customerId) {
  // catalog number -> Product ID, so results can be keyed back to the pid
  const catToPid = {};
  items.forEach(({ pid, catalogNumber }) => {
    if (pid && catalogNumber) catToPid[formatCatalogNumber(catalogNumber)] = pid;
  });
  const cats = [...new Set(Object.keys(catToPid))];

  // Only pass CustomerId when it is a clean numeric Eclipse account.
  // Until catalogs carry a real customer ID (Phase 3), a display-name
  // string is safely ignored and base pricing is returned.
  const custParam =
    customerId && /^\d+$/.test(String(customerId)) ? String(customerId) : null;

  // Eclipse caps results per call (~20-25) — batch the catalog numbers.
  let results = [];
  const BATCH = 20;
  for (let i = 0; i < cats.length; i += BATCH) {
    const batch = cats.slice(i, i + BATCH);
    const params = new URLSearchParams();
    batch.forEach((c) => params.append("CatalogNumber", c));
    params.append("Quantity", "1");
    params.append("CalculateOnlyForBranch", PRICE_BRANCH);
    if (custParam) params.append("CustomerId", custParam);

    const r = await authedGet(
      `${ECLIPSE_BASE}/ProductInventoryPricingMassInquiry?${params.toString()}`
    );
    if (!r.ok) continue; // skip a failed batch rather than fail the whole request
    try {
      const data = await r.json();
      results = results.concat(data.results || []);
    } catch {
      /* ignore a single batch's parse error */
    }
  }

  // Eclipse's pricing endpoint doesn't echo the requested catalog #, but
  // it embeds it in productDescription — match on that (dash-insensitive).
  const out = {};
  for (const cat of cats) {
    const pid = catToPid[cat];
    const catUpper = cat.toUpperCase();
    const noDash = catUpper.replace(/-/g, "");
    const match = results.find((r) => {
      const desc = String(r.productDescription || "").toUpperCase();
      return desc.includes(catUpper) || desc.replace(/-/g, "").includes(noDash);
    });
    out[pid] = match
      ? {
          price: match.unitPrice?.value ?? match.productUnitPrice?.value ?? null,
          onHand: match.totalWarehouseQty ?? 0,
        }
      : { price: null, onHand: 0 };
  }
  return out;
}
