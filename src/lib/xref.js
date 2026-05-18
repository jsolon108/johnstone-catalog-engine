/* Eclipse cross-reference logic.
 *
 * The xref maps (Brand, Model) -> Product ID. The Product ID is the
 * canonical, *unbranded* item identity: one Product ID can carry many
 * branded model numbers (the same physical unit rebadged across
 * Daikin / Goodman / Amana / etc.).
 */

export const norm = (s) => (s || "").trim().toUpperCase();

/* Build fast lookup indexes from a flat list of xref rows.
 * Each row: { brand, model, group, pid } */
export function buildIndex(xref) {
  const byModel = {}; // normalized model number -> product id
  const byPid = {}; // product id -> array of rows
  xref.forEach((r) => {
    byModel[norm(r.model)] = r.pid;
    (byPid[r.pid] = byPid[r.pid] || []).push(r);
  });
  return { byModel, byPid };
}

/* Resolve a catalog product's model number against the xref index.
 * Returns { pid: null } when the model is not in the cross-reference. */
export function resolve(model, idx) {
  const pid = idx.byModel[norm(model)];
  if (!pid) return { pid: null };
  const entries = idx.byPid[pid] || [];
  return {
    pid,
    group: entries[0]?.group,
    brands: [...new Set(entries.map((e) => e.brand))],
    models: [...new Set(entries.map((e) => e.model))],
  };
}
