import React, { useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import { Stat } from "./ui.jsx";
import { norm } from "../lib/xref.js";

export default function XRef({ xref, setXref, brand, onNext }) {
  const fileRef = useRef(null);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  // group rows by Product ID
  const groups = useMemo(() => {
    const m = {};
    xref.forEach((r) => (m[r.pid] = m[r.pid] || []).push(r));
    return Object.entries(m).map(([pid, rows]) => ({
      pid,
      rows,
      brands: [...new Set(rows.map((r) => r.brand))],
      models: [...new Set(rows.map((r) => r.model))],
      group: rows[0].group,
    }));
  }, [xref]);

  const shared = groups.filter((g) => g.brands.length > 1 || g.models.length > 1).length;
  const filtered = q
    ? groups.filter(
        (g) =>
          g.pid.includes(q) ||
          g.rows.some((r) => norm(r.model).includes(norm(q)) || norm(r.brand).includes(norm(q)))
      )
    : groups;

  const onImport = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: "array" });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        const mapped = rows
          .map((r) => ({
            brand: String(r["Brand"] ?? "").trim(),
            model: String(r["Model Number"] ?? "").trim(),
            group: String(r["Model Group"] ?? "").trim(),
            pid: String(r["Product ID"] ?? "").trim(),
          }))
          .filter((r) => r.model && r.pid);
        if (!mapped.length)
          throw new Error("No usable rows. Expected columns: Brand, Model Number, Model Group, Product ID.");
        setXref(mapped);
      } catch (ex) {
        setErr(ex.message || "Could not read that file.");
      }
    };
    reader.readAsArrayBuffer(f);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Eclipse Cross-Reference</h1>
          <p className="max-w-2xl text-sm text-slate-500">
            The lookup that maps branded model numbers to Eclipse Product IDs. One Product ID is the canonical
            <strong> unbranded</strong> item — the same physical unit can carry several model numbers across brands.
          </p>
        </div>
        <button onClick={onNext} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ background: brand }}>
          Next: Customer View →
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Stat label="Model #s" value={xref.length} />
        <Stat label="Eclipse Product IDs" value={groups.length} tone="ok" />
        <Stat label="Shared / unbranded IDs" value={shared} tone={shared ? "warn" : "ok"} />
        <div className="flex-1" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search model, brand, or ID…"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
        />
        <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={onImport} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium">
          Import xref (.xlsx)
        </button>
      </div>
      {err && <div className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{err}</div>}

      <div className="space-y-2">
        {filtered.map((g) => {
          const isShared = g.brands.length > 1 || g.models.length > 1;
          return (
            <div key={g.pid} className="rounded-xl border border-stone-200 bg-white p-3">
              <div className="flex items-center gap-3">
                <div className="font-mono text-sm font-bold text-slate-800">Eclipse {g.pid}</div>
                <div className="text-xs text-slate-400">{g.group}</div>
                {g.brands.length > 1 && (
                  <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">Unbranded · {g.brands.length} brands</span>
                )}
                {g.models.length > 1 && (
                  <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-medium text-slate-600">{g.models.length} model numbers</span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {g.rows.map((r, i) => (
                  <span key={i} className={`rounded border px-2 py-0.5 text-xs ${isShared ? "border-stone-200 bg-stone-50" : "border-transparent bg-stone-100"}`}>
                    <span className="text-slate-400">{r.brand}</span> <span className="font-mono text-slate-700">{r.model}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-slate-400">No matches</div>
        )}
      </div>

      <p className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-xs text-slate-600">
        Loaded with a sample. Use <strong>Import xref</strong> to load the full Xref_Results.xlsx (Brand, Model
        Number, Model Group, Product ID). In production this syncs from Eclipse directly so it never goes stale.
      </p>
    </div>
  );
}
