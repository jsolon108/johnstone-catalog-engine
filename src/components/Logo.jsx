import React from "react";

/* Company logo. Renders the uploaded image when present, otherwise a
 * plain typographic wordmark stands in until the official Johnstone
 * Supply logo file is uploaded on the Build tab. */
export default function Logo({ catalog, size = "md" }) {
  const big = size === "lg";
  if (catalog.logo) {
    return (
      <img
        src={catalog.logo}
        alt="Johnstone Supply"
        style={{ height: big ? 48 : 32 }}
        className="object-contain"
      />
    );
  }
  return (
    <div
      className={`leading-[0.95] font-extrabold tracking-tight ${big ? "text-2xl" : "text-sm"}`}
      style={{ color: catalog.brand }}
    >
      JOHNSTONE
      <br />
      SUPPLY
    </div>
  );
}
