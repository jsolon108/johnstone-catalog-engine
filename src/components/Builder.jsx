import React, { useRef } from "react";
import Logo from "./Logo.jsx";
import { Panel, Field } from "./ui.jsx";
import { resolve } from "../lib/xref.js";
import { uid } from "../lib/util.js";

export default function Builder({ catalog, setCatalog, idx, onNext }) {
  const fileRef = useRef(null);
  const set = (patch) => setCatalog((c) => ({ ...c, ...patch }));

  const updateCategory = (id, patch) =>
    set({ categories: catalog.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const addCategory = () =>
    set({ categories: [...catalog.categories, { id: uid(), name: "New Category", blurb: "", products: [] }] });
  const removeCategory = (id) =>
    set({ categories: catalog.categories.filter((c) => c.id !== id) });
  const addProduct = (catId) => {
    const cat = catalog.categories.find((c) => c.id === catId);
    updateCategory(catId, {
      products: [...cat.products, { id: uid(), model: "", name: "New Product", cap: "", seer: "", refrig: "" }],
    });
  };

  const onLogo = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => set({ logo: reader.result });
    reader.readAsDataURL(f);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Build Catalog</h1>
          <p className="text-sm text-slate-500">
            Add products by model number. The Eclipse Product ID resolves automatically from the cross-reference.
          </p>
        </div>
        <button onClick={onNext} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ background: catalog.brand }}>
          Next: Eclipse Cross-Ref →
        </button>
      </div>

      <Panel title="Catalog Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Catalog name" value={catalog.name} onChange={(v) => set({ name: v })} />
          <Field label="Subtitle" value={catalog.subtitle} onChange={(v) => set({ subtitle: v })} />
          <Field label="Customer name" value={catalog.customer} onChange={(v) => set({ customer: v })} />
          <Field label="Eclipse customer ID (number)" value={catalog.customerId || ""} onChange={(v) => set({ customerId: v })} />
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Brand color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={catalog.brand} onChange={(e) => set({ brand: e.target.value })} className="h-9 w-12 cursor-pointer rounded border border-stone-300" />
              <span className="text-sm text-slate-600">{catalog.brand}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 rounded-lg border border-stone-200 bg-stone-50 p-3">
          <div className="grid h-16 w-32 place-items-center rounded border border-stone-200 bg-white">
            <Logo catalog={catalog} size="lg" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Company logo</div>
            <p className="text-xs text-slate-500">Upload the official Johnstone Supply logo (PNG/SVG). A plain wordmark stands in until then.</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onLogo} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium">Upload logo</button>
          {catalog.logo && <button onClick={() => set({ logo: null })} className="text-xs text-slate-400 hover:text-rose-500">Remove</button>}
        </div>
      </Panel>

      {catalog.categories.map((cat) => (
        <Panel
          key={cat.id}
          title={<input value={cat.name} onChange={(e) => updateCategory(cat.id, { name: e.target.value })} className="w-full bg-transparent text-base font-bold outline-none" />}
          action={<button onClick={() => removeCategory(cat.id)} className="text-xs font-medium text-rose-500 hover:underline">Remove section</button>}
        >
          <input
            value={cat.blurb}
            placeholder="Short section description…"
            onChange={(e) => updateCategory(cat.id, { blurb: e.target.value })}
            className="mb-3 w-full rounded border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm outline-none"
          />
          <div className="overflow-hidden rounded-lg border border-stone-200">
            <div className="grid grid-cols-12 gap-2 bg-stone-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <div className="col-span-4">Model # → Eclipse resolution</div>
              <div className="col-span-4">Name</div>
              <div className="col-span-2">Capacity</div>
              <div className="col-span-1">SEER2</div>
              <div className="col-span-1" />
            </div>
            {cat.products.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                idx={idx}
                onChange={(patch) =>
                  updateCategory(cat.id, { products: cat.products.map((x) => (x.id === p.id ? { ...x, ...patch } : x)) })
                }
                onRemove={() => updateCategory(cat.id, { products: cat.products.filter((x) => x.id !== p.id) })}
              />
            ))}
            {cat.products.length === 0 && <div className="px-3 py-4 text-center text-sm text-slate-400">No products yet</div>}
          </div>
          <button onClick={() => addProduct(cat.id)} className="mt-2 text-sm font-medium text-slate-600 hover:text-slate-900">+ Add product</button>
        </Panel>
      ))}

      <button
        onClick={addCategory}
        className="w-full rounded-xl border-2 border-dashed border-stone-300 py-4 text-sm font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700"
      >
        + Add catalog section
      </button>
    </div>
  );
}

function ProductRow({ product, idx, onChange, onRemove }) {
  const cell = "rounded border border-transparent bg-transparent px-2 py-1 text-sm outline-none focus:border-stone-300 focus:bg-white";
  const r = resolve(product.model, idx);
  return (
    <div className="grid grid-cols-12 items-start gap-2 border-t border-stone-100 px-3 py-1.5">
      <div className="col-span-4">
        <input className={`w-full font-mono ${cell}`} value={product.model} placeholder="RXS09LVJU" onChange={(e) => onChange({ model: e.target.value })} />
        <div className="px-2 text-xs">
          {!product.model.trim() ? (
            <span className="text-slate-300">enter a model number</span>
          ) : r.pid ? (
            <span className="text-emerald-600">
              → Eclipse {r.pid}
              {r.brands.length > 1 && <span className="ml-1 rounded bg-sky-100 px-1 text-sky-700">unbranded · {r.brands.length} brands</span>}
              {r.models.length > 1 && <span className="ml-1 rounded bg-stone-100 px-1 text-slate-600">{r.models.length} model #s</span>}
            </span>
          ) : (
            <span className="text-amber-600">not found in cross-reference</span>
          )}
        </div>
      </div>
      <input className={`col-span-4 mt-0.5 ${cell}`} value={product.name} onChange={(e) => onChange({ name: e.target.value })} />
      <input className={`col-span-2 mt-0.5 ${cell}`} value={product.cap} placeholder="9,000 BTU" onChange={(e) => onChange({ cap: e.target.value })} />
      <input className={`col-span-1 mt-0.5 ${cell}`} value={product.seer} onChange={(e) => onChange({ seer: e.target.value })} />
      <button onClick={onRemove} className="col-span-1 mt-1 text-right text-xs text-slate-400 hover:text-rose-500">✕</button>
    </div>
  );
}
