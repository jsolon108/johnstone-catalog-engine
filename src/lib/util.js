export const money = (n) => (n == null ? "—" : "$" + n.toLocaleString());
export const uid = () => Math.random().toString(36).slice(2, 9);
