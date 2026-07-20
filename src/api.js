const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function getJSON(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
