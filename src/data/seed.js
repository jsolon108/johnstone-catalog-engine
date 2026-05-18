/* Sample catalog definition.
 *
 * A catalog product stores only a MODEL NUMBER — the Eclipse Product ID
 * is resolved from the cross-reference at render time.
 *
 * Notes on the sample data:
 *  - FTXC09AXVJU is intentionally NOT in the sample xref -> shows the
 *    "not found in cross-reference" state.
 *  - KRP067A41 and KRP067A41E both resolve to Product ID 212574 ->
 *    demonstrates "same Eclipse item" de-duplication.
 *  - HKSC05XC is sold under three brands -> shows the "unbranded" badge.
 */
export const SEED = {
  name: "Ductless Equipment Catalog",
  subtitle: "Daikin Heat Pump Systems & Accessories",
  brand: "#003a70",
  customer: "All Season Climate Pros",
  customerId: "46017",
  logo: null,
  categories: [
    {
      id: "c1",
      name: "RXS Series — Outdoor Heat Pumps",
      blurb: "Single-zone inverter heat pump outdoor units.",
      products: [
        { id: "p1", model: "RXS09LVJU", name: "RXS 9K Outdoor Unit", cap: "9,000 BTU", seer: "—", refrig: "R-410A" },
        { id: "p2", model: "RXS12LVJU", name: "RXS 12K Outdoor Unit", cap: "12,000 BTU", seer: "—", refrig: "R-410A" },
        { id: "p3", model: "RXS18LVJU", name: "RXS 18K Outdoor Unit", cap: "18,000 BTU", seer: "—", refrig: "R-410A" },
      ],
    },
    {
      id: "c2",
      name: "FTXS Series — Indoor Wall Mount",
      blurb: "Matching wall-mount indoor units.",
      products: [
        { id: "p4", model: "FTXS09LVJU", name: "FTXS 9K Indoor Wall Mount", cap: "9,000 BTU", seer: "—", refrig: "R-410A" },
        { id: "p5", model: "FTXS12LVJU", name: "FTXS 12K Indoor Wall Mount", cap: "12,000 BTU", seer: "—", refrig: "R-410A" },
        { id: "p6", model: "FTXC09AXVJU", name: "ENTRA 9K Indoor (newer)", cap: "9,000 BTU", seer: "—", refrig: "R-32" },
      ],
    },
    {
      id: "c3",
      name: "Controls & Accessories",
      blurb: "Remotes, adaptors, and heat kits.",
      products: [
        { id: "p7", model: "BRC944B2-A08", name: "Wired Remote Controller Kit", cap: "—", seer: "—", refrig: "—" },
        { id: "p8", model: "KRP067A41", name: "Wired Controller Adaptor (09 & 12)", cap: "—", seer: "—", refrig: "—" },
        { id: "p9", model: "KRP067A41E", name: "Interface Adaptor for Wired Controllers", cap: "—", seer: "—", refrig: "—" },
        { id: "p10", model: "HKSC05XC", name: "5 kW Electric Heat Kit", cap: "—", seer: "—", refrig: "—" },
      ],
    },
  ],
};
