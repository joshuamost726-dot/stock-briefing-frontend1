import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const tickers = ['RILY', 'SKHY', 'ASTS', 'LRCX', 'QCOM', 'CWBHF'];


export default function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    setStocks(
      tickers.map(ticker => ({
        ticker,
        convictionScore: Math.random() * 100
      }))
    );
    setLoading(false);
  }, []);

  const getConfidenceTier = (score) => {
    if (score >= 70) return { label: 'High', color: '#4ADE80' };
    if (score >= 50) return { label: 'Moderate', color: '#EAB84D' };
    return { label: 'Low', color: '#F87171' };
  };

  const getActionCall = (score) => {
    if (score >= 70) return '→ BUY';
    if (score >= 50) return '→ HOLD';
    return '→ SELL';
  };

  if (loading) return <div style={{ padding: '20px', color: '#E8EAED' }}>Loading...</div>;

  return (
    <div style={{ padding: '30px' }}>
      <h1 style={{ color: '#E8EAED', marginBottom: '30px', fontSize: '24px' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {stocks.map((stock) => {
          const tier = getConfidenceTier(stock.convictionScore);
          const action = getActionCall(stock.convictionScore);

          return (
            <div
              key={stock.ticker}
              onClick={() => navigate(`/ticker/${stock.ticker}`)}
              style={{
                backgroundColor: '#131720',
                border: '1px solid #232A38',
                borderRadius: '8px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A2030')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#131720')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ fontFamily: 'IBM Plex Mono', color: '#D4A574', fontSize: '18px' }}>{stock.ticker}</h2>
                <span style={{ color: tier.color, fontSize: '14px', fontWeight: 'bold' }}>{action}</span>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ backgroundColor: '#232A38', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: tier.color,
                      width: `${stock.convictionScore}%`,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'IBM Plex Mono', color: '#E8EAED', fontSize: '14px' }}>
                  {Math.round(stock.convictionScore)}/100
                </span>
                <span style={{ color: tier.color, fontSize: '12px', fontWeight: 'bold' }}>{tier.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
