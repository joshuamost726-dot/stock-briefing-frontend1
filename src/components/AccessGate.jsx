import { useEffect, useState } from "react";
import { getStoredCode, setStoredCode, verifyAccessCode } from "../api";

// Wraps the whole app. Checks the stored code (even an empty one — the
// backend itself decides whether a gate is configured at all via
// ACCESS_CODE, so local dev without it set just passes straight through)
// before rendering anything else, including the sidebar.
export default function AccessGate({ children }) {
  const [status, setStatus] = useState("checking");
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    verifyAccessCode(getStoredCode()).then(valid => setStatus(valid ? "unlocked" : "locked"));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const valid = await verifyAccessCode(input.trim());
    if (valid) {
      setStoredCode(input.trim());
      setStatus("unlocked");
    } else {
      setError("Wrong code.");
    }
    setSubmitting(false);
  }

  if (status === "checking") return null;

  if (status === "locked") {
    return (
      <div className="access-gate">
        <form className="access-gate-form" onSubmit={handleSubmit}>
          <span className="access-gate-mark">🔒</span>
          <p>Enter access code</p>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
            required
          />
          <button type="submit" disabled={submitting}>{submitting ? "Checking…" : "Unlock"}</button>
          {error && <p className="access-gate-error">{error}</p>}
        </form>
      </div>
    );
  }

  return children;
}
