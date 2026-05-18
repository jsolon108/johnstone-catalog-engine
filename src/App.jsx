import React, { useState, useMemo } from "react";
import { buildIndex } from "./lib/xref.js";
import { SEED } from "./data/seed.js";
import { XREF_SEED } from "./data/xrefSeed.js";
import TopBar from "./components/TopBar.jsx";
import Builder from "./components/Builder.jsx";
import XRef from "./components/XRef.jsx";
import Preview from "./components/Preview.jsx";

/* JOHNSTONE SUPPLY — CATALOG ENGINE
 *
 * Three concerns kept deliberately separate:
 *   1. CATALOG DEFINITION  — curated, slow-changing (Builder)
 *   2. PRICING             — live, per-customer    (Eclipse ERP)
 *   3. PRESENTATION        — branded template      (Preview)
 *
 * State is currently in-memory. Phase 2 moves the catalog definition
 * into Supabase so catalogs get stable, shareable URLs. See README.
 */
export default function App() {
  const [catalog, setCatalog] = useState(SEED);
  const [xref, setXref] = useState(XREF_SEED);
  const [mode, setMode] = useState("builder"); // builder | xref | preview

  const idx = useMemo(() => buildIndex(xref), [xref]);

  return (
    <div
      style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
      className="min-h-screen bg-stone-100 text-slate-800"
    >
      <TopBar mode={mode} setMode={setMode} catalog={catalog} />
      {mode === "builder" && (
        <Builder catalog={catalog} setCatalog={setCatalog} idx={idx} onNext={() => setMode("xref")} />
      )}
      {mode === "xref" && (
        <XRef xref={xref} setXref={setXref} brand={catalog.brand} onNext={() => setMode("preview")} />
      )}
      {mode === "preview" && (
        <Preview catalog={catalog} idx={idx} onBack={() => setMode("xref")} />
      )}
    </div>
  );
}
