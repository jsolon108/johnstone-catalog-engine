import React from "react";

export function Panel({ title, action, children }) {
  return (
    <div className="mb-4 rounded-xl border border-stone-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 text-base font-bold">{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
      />
    </div>
  );
}

export function Stat({ label, value, tone }) {
  const color = tone === "warn" ? "#b45309" : tone === "ok" ? "#047857" : "#334155";
  return (
    <div className="flex items-baseline gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2">
      <span className="text-xl font-bold tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
    </div>
  );
}
