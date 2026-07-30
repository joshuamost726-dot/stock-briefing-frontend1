import { useEffect, useState } from "react";
import { getJSON, sendJSON } from "../api";

function PositionRow({ stock, onChange }) {
  const [costPerShare, setCostPerShare] = useState(stock.position?.costPerShare ?? "");
  const [shares, setShares] = useState(stock.position?.shares ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await sendJSON(`/api/stocks/${stock.ticker}/position`, "PUT", {
        costPerShare: Number(costPerShare),
        shares: Number(shares),
      });
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setSaving(true);
    setError(null);
    try {
      await sendJSON(`/api/stocks/${stock.ticker}/position`, "DELETE");
      setCostPerShare("");
      setShares("");
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="settings-position-row" onSubmit={handleSave}>
      <span className="settings-position-ticker">{stock.ticker}</span>
      <label className="settings-inline-field">
        Cost/share
        <input type="number" step="0.01" min="0.01" value={costPerShare}
          onChange={e => setCostPerShare(e.target.value)} required />
      </label>
      <label className="settings-inline-field">
        Shares
        <input type="number" step="0.0001" min="0.0001" value={shares}
          onChange={e => setShares(e.target.value)} required />
      </label>
      <div className="settings-position-actions">
        <button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        {stock.position && (
          <button type="button" className="settings-btn-secondary" onClick={handleClear} disabled={saving}>Clear</button>
        )}
      </div>
      {error && <span className="settings-error">{error}</span>}
    </form>
  );
}

function ImportReviewRow({ row, onChange, onRemove }) {
  return (
    <div className="import-review-row">
      <span className="settings-position-ticker">{row.ticker}</span>
      <label className="settings-inline-field">
        Shares
        <input type="number" step="0.0001" min="0.0001" value={row.shares}
          onChange={e => onChange({ ...row, shares: e.target.value })} />
      </label>
      <label className="settings-inline-field">
        Cost/share
        <input type="number" step="0.01" min="0.01" value={row.costPerShare}
          onChange={e => onChange({ ...row, costPerShare: e.target.value })} />
      </label>
      {row.isTracked ? (
        <span className="import-tracked-badge">Already tracked — will update position</span>
      ) : (
        <label className="import-track-checkbox">
          <input type="checkbox" checked={row.track}
            onChange={e => onChange({ ...row, track: e.target.checked })} />
          Start tracking this stock too
        </label>
      )}
      <button type="button" className="settings-btn-secondary" onClick={onRemove}>Remove</button>
    </div>
  );
}

// Shared by CSV import and E*TRADE sync — whichever source found the
// positions, this is the one place that lets the user review/edit/exclude
// before anything is written, and the one call to POST /api/positions/apply
// that actually writes it.
function PositionReviewTable({ positions, warnings = [], formatNote, onApplied }) {
  const [rows, setRows] = useState(() => positions.map((p, i) => ({ ...p, track: !p.isTracked, key: i })));
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  function updateRow(key, updated) {
    setRows(rows.map(r => (r.key === key ? updated : r)));
  }

  function removeRow(key) {
    setRows(rows.filter(r => r.key !== key));
  }

  async function handleApply() {
    setApplying(true);
    setError(null);
    try {
      const res = await sendJSON("/api/positions/apply", "POST", {
        positions: rows.map(r => ({
          ticker: r.ticker,
          shares: Number(r.shares),
          costPerShare: Number(r.costPerShare),
          track: r.track,
        })),
      });
      setResult(res);
      setRows([]);
      onApplied();
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  }

  if (result) {
    return (
      <p className="import-result-note">
        Applied {result.applied.length} position{result.applied.length === 1 ? "" : "s"}
        {result.skipped.length > 0 && ` — skipped ${result.skipped.length}: ${result.skipped.map(s => `${s.ticker} (${s.reason})`).join("; ")}`}
      </p>
    );
  }

  return (
    <div className="import-review">
      {formatNote && <p className="import-format-note">{formatNote}</p>}
      {warnings.length > 0 && (
        <ul className="import-warnings">
          {warnings.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      )}
      {error && <p className="settings-error">{error}</p>}
      <div className="import-review-list">
        {rows.map(row => (
          <ImportReviewRow
            key={row.key}
            row={row}
            onChange={updated => updateRow(row.key, updated)}
            onRemove={() => removeRow(row.key)}
          />
        ))}
      </div>
      {rows.length > 0 ? (
        <button className="settings-btn-secondary import-apply-btn" onClick={handleApply} disabled={applying}>
          {applying ? "Applying…" : `Apply ${rows.length} position${rows.length === 1 ? "" : "s"}`}
        </button>
      ) : (
        <p className="settings-section-intro">Nothing left to apply.</p>
      )}
    </div>
  );
}

function PositionImportSection({ onApplied }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [importKey, setImportKey] = useState(0);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError(null);
    setPreview(null);
    try {
      const text = await file.text();
      const res = await sendJSON("/api/positions/preview-csv", "POST", { csvText: text });
      if (res.format === "unknown" || res.positions.length === 0) {
        setError(res.warnings?.[0] || "Couldn't find any positions in that file.");
        return;
      }
      setPreview(res);
      setImportKey(k => k + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      e.target.value = "";
    }
  }

  return (
    <section className="settings-section">
      <h2>Import Positions (Robinhood, or any brokerage)</h2>
      <p className="settings-section-intro">
        Robinhood has no official way to connect an account directly, so this is the safe
        alternative: export your holdings or account statement as a CSV from Robinhood (or any
        brokerage) and upload it here. Nothing is shared with your brokerage, and nothing is saved
        until you review it below and hit Apply.
      </p>

      <input type="file" accept=".csv,text/csv" onChange={handleFile} className="import-file-input" />

      {error && <p className="settings-error">{error}</p>}

      {preview && (
        <PositionReviewTable
          key={importKey}
          positions={preview.positions}
          warnings={preview.warnings}
          formatNote={`Read as a ${preview.format === "transactions" ? "transaction history" : "positions"} file — ${preview.positions.length} holding${preview.positions.length === 1 ? "" : "s"} found. Review before applying.`}
          onApplied={onApplied}
        />
      )}
    </section>
  );
}

function EtradeSection({ onApplied }) {
  const [status, setStatus] = useState(null);
  const [authorizeUrl, setAuthorizeUrl] = useState(null);
  const [verifierCode, setVerifierCode] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [importKey, setImportKey] = useState(0);

  function refetchStatus() {
    return getJSON("/api/etrade/status").then(setStatus).catch(() => {});
  }

  useEffect(() => {
    refetchStatus();
  }, []);

  async function handleConnect() {
    setConnecting(true);
    setError(null);
    try {
      const res = await sendJSON("/api/etrade/connect", "POST");
      setAuthorizeUrl(res.authorizeUrl);
      window.open(res.authorizeUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    try {
      await sendJSON("/api/etrade/verify", "POST", { verifierCode: verifierCode.trim() });
      setAuthorizeUrl(null);
      setVerifierCode("");
      await refetchStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  }

  async function handleFetchPositions() {
    setFetching(true);
    setError(null);
    setPreview(null);
    try {
      const res = await getJSON("/api/etrade/positions");
      if (res.positions.length === 0) {
        setError(res.warnings?.[0] || "No positions found.");
        return;
      }
      setPreview(res);
      setImportKey(k => k + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }

  async function handleDisconnect() {
    await sendJSON("/api/etrade/disconnect", "POST");
    setPreview(null);
    refetchStatus();
  }

  if (!status) return null;

  return (
    <section className="settings-section">
      <h2>Connect E*TRADE</h2>

      {!status.configured && (
        <div>
          <p className="settings-section-intro">
            E*TRADE has a real, official API — unlike Robinhood, it doesn't require sharing your
            password with this app. It does require registering a free developer app on E*TRADE's
            own site first:
          </p>
          <ol className="etrade-steps">
            <li>Go to <a href="https://developer.etrade.com/getting-started" target="_blank" rel="noopener noreferrer">developer.etrade.com</a> and sign up (free).</li>
            <li>Create a new app to get a Consumer Key and Consumer Secret — these identify this app, not your login.</li>
            <li>Add them to the backend as environment variables named <code>ETRADE_CONSUMER_KEY</code> and <code>ETRADE_CONSUMER_SECRET</code> — in <code>.env</code> for local dev, and in Render's dashboard for production. Never paste them into this app or into chat.</li>
            <li>Restart the backend, then reload this page — the Connect button will appear.</li>
          </ol>
          <p className="settings-section-intro">
            E*TRADE gives you Sandbox keys immediately (fake test data — safe to try first) and Live
            keys after a separate approval step. This app defaults to Sandbox until you explicitly
            set <code>ETRADE_ENV=live</code>.
          </p>
        </div>
      )}

      {status.configured && !status.connected && !authorizeUrl && (
        <>
          <p className="settings-section-intro">
            {status.live ? "Live" : "Sandbox"} keys detected. Connect opens E*TRADE's own login page
            in a new tab — your password goes to E*TRADE, never to this app.
          </p>
          <button className="settings-btn-secondary" onClick={handleConnect} disabled={connecting}>
            {connecting ? "Starting…" : "Connect E*TRADE"}
          </button>
        </>
      )}

      {authorizeUrl && (
        <form className="etrade-verify-form" onSubmit={handleVerify}>
          <p className="settings-section-intro">
            Log in and approve access in the tab that just opened — E*TRADE will show you a
            verification code. Paste it here:
          </p>
          <input placeholder="Verification code" value={verifierCode}
            onChange={e => setVerifierCode(e.target.value)} required />
          <button type="submit" disabled={verifying}>{verifying ? "Confirming…" : "Confirm"}</button>
        </form>
      )}

      {status.connected && (
        <div className="etrade-connected-row">
          <span className="import-tracked-badge">
            Connected{status.connectedAt ? ` since ${new Date(status.connectedAt).toLocaleDateString()}` : ""}
            {!status.live && " (Sandbox — test data, not your real account)"}
          </span>
          <button className="settings-btn-secondary" onClick={handleFetchPositions} disabled={fetching}>
            {fetching ? "Fetching…" : "Fetch positions"}
          </button>
          <button className="settings-btn-secondary" onClick={handleDisconnect}>Disconnect</button>
        </div>
      )}

      {error && <p className="settings-error">{error}</p>}

      {preview && (
        <PositionReviewTable
          key={importKey}
          positions={preview.positions}
          warnings={preview.warnings}
          formatNote={`${preview.positions.length} holding${preview.positions.length === 1 ? "" : "s"} found in your E*TRADE account. Review before applying.`}
          onApplied={onApplied}
        />
      )}
    </section>
  );
}

export default function Settings() {
  const [stocks, setStocks] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [newTicker, setNewTicker] = useState("");
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState(null);
  const [adding, setAdding] = useState(false);

  function refetchStocks() {
    return getJSON("/api/stocks").then(setStocks).catch(err => setLoadError(err.message));
  }

  useEffect(() => {
    refetchStocks();
  }, []);

  async function handleAddStock(e) {
    e.preventDefault();
    if (!newTicker.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      const updated = await sendJSON("/api/stocks", "POST", {
        ticker: newTicker.toUpperCase().trim(),
        name: newName.trim(),
      });
      setStocks(updated);
      setNewTicker("");
      setNewName("");
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveStock(ticker) {
    const updated = await sendJSON(`/api/stocks/${ticker}`, "DELETE");
    setStocks(updated);
  }

  if (loadError) {
    return <div className="detail-page"><p style={{ color: "var(--negative)" }}>Couldn't load settings. {loadError}</p></div>;
  }

  if (!stocks) {
    return <div className="detail-page"><p style={{ color: "var(--text-secondary)" }}>Loading…</p></div>;
  }

  return (
    <div className="detail-page settings-page">
      <h1 className="settings-title">Settings</h1>

      <section className="settings-section">
        <h2>Positions</h2>
        <p className="settings-section-intro">
          Set your cost basis for every tracked stock in one place — same data as each ticker's own
          "Your Position" section, just all together here.
        </p>
        <div className="settings-positions-list">
          {stocks.map(stock => (
            <PositionRow key={stock.ticker} stock={stock} onChange={refetchStocks} />
          ))}
        </div>
      </section>

      <PositionImportSection onApplied={refetchStocks} />

      <EtradeSection onApplied={refetchStocks} />

      <section className="settings-section">
        <h2>Tracked Stocks</h2>
        <div className="settings-stocks-list">
          {stocks.map(stock => (
            <div key={stock.ticker} className="settings-stock-row">
              <span className="settings-stock-ticker">{stock.ticker}</span>
              <span className="settings-stock-name">{stock.name}</span>
              <button className="settings-remove-btn" onClick={() => handleRemoveStock(stock.ticker)}>Remove</button>
            </div>
          ))}
        </div>
        <form className="settings-add-stock-form" onSubmit={handleAddStock}>
          <input placeholder="Ticker (e.g. AAPL)" value={newTicker}
            onChange={e => setNewTicker(e.target.value)} required />
          <input placeholder="Company name (optional)" value={newName}
            onChange={e => setNewName(e.target.value)} />
          <button type="submit" disabled={adding}>{adding ? "Adding…" : "+ Add Stock"}</button>
        </form>
        {addError && <p className="settings-error">{addError}</p>}
      </section>
    </div>
  );
}
