import React, { useState, useEffect, useMemo, useCallback } from "react";
import Logo from "./Logo.jsx";
import { resolve } from "../lib/xref.js";
import { fetchEclipsePricing } from "../lib/pricing.js";
import { money } from "../lib/util.js";

export default function Preview({ catalog, idx, onBack }) {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(false);

  /* Resolve every product. Collect ONE { pid, catalogNumber } per
   * unique Product ID (models that share a pid price identically, so
   * any one model number is enough). Also count how many times each
   * pid appears so duplicates can be flagged in the table. */
  const { items, pidCount } = useMemo(() => {
    const seen = {};
    const count = {};
    catalog.categories.forEach((c) =>
      c.products.forEach((p) => {
        const r = resolve(p.model, idx);
        if (!r.pid) return;
        count[r.pid] = (count[r.pid] || 0) + 1;
        if (!seen[r.pid]) seen[r.pid] = { pid: r.pid, catalogNumber: p.model };
      })
    );
    return { items: Object.values(seen), pidCount: count };
  }, [catalog, idx]);

  const load = useCallback(() => {
    setLoading(true);
    fetchEclipsePricing(items, contract ? catalog.customer : null).then((m) => {
      setPricing(m);
      setLoading(false);
    });
  }, [items, contract, catalog.customer]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="text-sm font-medium text-slate-600 hover:text-slate-900">← Back to cross-ref</button>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm">
            <input type="checkbox" checked={contract} onChange={(e) => setContract(e.target.checked)} />
            Show this customer's contract pricing
          </label>
          <button onClick={load} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium">↻ Refresh pricing</button>
          <button onClick={() => window.print()} className="rounded-lg px-4 py-1.5 text-sm font-semibold text-white" style={{ background: catalog.brand }}>
            Export PDF
          </button>
        </div>
      </div>

      <div className="print-area rounded-xl bg-white shadow-lg">
        <div className="flex items-start justify-between rounded-t-xl px-10 py-8 text-white" style={{ background: catalog.brand }}>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">Johnstone Supply NY/CT</div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{catalog.name}</h1>
            <p className="text-sm opacity-90">{catalog.subtitle}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs opacity-80">
              <span>{catalog.customer}</span>
              <span>•</span>
              <span>Pricing as of {loading ? "loading…" : new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
              {contract && <span className="rounded bg-white/20 px-2 py-0.5 font-semibold">Contract pricing</span>}
            </div>
          </div>
          <div className="rounded bg-white px-3 py-2">
            <Logo catalog={catalog} size="lg" />
          </div>
        </div>

        <div className="px-10 py-8">
          {catalog.categories.map((cat) => (
            <section key={cat.id} className="mb-9">
              <h2 className="text-lg font-bold tracking-tight" style={{ color: catalog.brand }}>{cat.name}</h2>
              {cat.blurb && <p className="mb-3 text-sm text-slate-500">{cat.blurb}</p>}
              <div className="overflow-hidden rounded-lg border border-stone-200">
                <div className="grid grid-cols-12 gap-2 border-b border-stone-200 bg-stone-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <div className="col-span-3">Model #</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Capacity</div>
                  <div className="col-span-2 text-right">Stock</div>
                  <div className="col-span-1 text-right">Price</div>
                </div>
                {cat.products.map((p) => {
                  const r = resolve(p.model, idx);
                  const pr = r.pid ? pricing?.[r.pid] : null;
                  const dup = r.pid && pidCount[r.pid] > 1;
                  return (
                    <div key={p.id} className="grid grid-cols-12 gap-2 border-b border-stone-100 px-4 py-2.5 text-sm last:border-0">
                      <div className="col-span-3">
                        <span className="font-mono text-slate-700">{p.model || "—"}</span>
                        {dup && (
                          <span className="ml-1 rounded bg-sky-50 px-1 text-xs text-sky-600" title={`Same Eclipse item ${r.pid}`}>
                            same item
                          </span>
                        )}
                      </div>
                      <div className="col-span-4 text-slate-800">{p.name}</div>
                      <div className="col-span-2 text-slate-600">{p.cap || "—"}</div>
                      <div className="col-span-2 text-right">
                        {!r.pid ? (
                          <span className="text-amber-500">not in xref</span>
                        ) : loading ? (
                          <span className="text-slate-300">···</span>
                        ) : pr ? (
                          <span className={pr.onHand > 0 ? "text-emerald-600" : "text-rose-500"}>
                            {pr.onHand > 0 ? `${pr.onHand} on hand` : "Call"}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                      <div className="col-span-1 text-right font-bold tabular-nums">
                        {!r.pid ? (
                          <span className="text-amber-400">—</span>
                        ) : loading ? (
                          <span className="text-slate-300">···</span>
                        ) : (
                          money(pr?.price)
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="mt-8 border-t border-stone-200 pt-4 text-xs text-slate-400">
            Johnstone Supply NY/CT — {catalog.customer}. Pricing is live from Eclipse ERP, fetched per Product ID,
            and subject to change. AHRI matchups, models, and prices subject to change without notice.
          </div>
        </div>
      </div>
    </div>
  );
}