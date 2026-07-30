const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const CODE_STORAGE_KEY = "accessCode";

export function getStoredCode() {
  return localStorage.getItem(CODE_STORAGE_KEY) || "";
}

export function setStoredCode(code) {
  localStorage.setItem(CODE_STORAGE_KEY, code);
}

export async function verifyAccessCode(code) {
  const res = await fetch(`${BASE}/api/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.valid;
}

export async function getJSON(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-Access-Code": getStoredCode() },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function sendJSON(path, method, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "X-Access-Code": getStoredCode(),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.error || `${res.status} ${res.statusText}`);
  }
  return res.json();
}
