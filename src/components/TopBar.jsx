import React from "react";
import Logo from "./Logo.jsx";

const TABS = [
  ["builder", "Build"],
  ["xref", "Eclipse Cross-Ref"],
  ["preview", "Customer View"],
];

export default function TopBar({ mode, setMode, catalog }) {
  return (
    <div className="no-print sticky top-0 z-20 border-b border-stone-300 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Logo catalog={catalog} />
          <div className="border-l border-stone-300 pl-3 text-xs text-slate-500">Catalog Engine</div>
        </div>
        <div className="flex rounded-lg border border-stone-300 p-0.5 text-sm">
          {TABS.map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="tick rounded-md px-4 py-1.5 font-medium"
              style={mode === m ? { background: catalog.brand, color: "#fff" } : { color: "#475569" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
