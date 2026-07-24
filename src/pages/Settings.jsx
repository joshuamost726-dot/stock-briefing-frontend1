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
