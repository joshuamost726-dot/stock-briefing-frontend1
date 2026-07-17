import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const tickers = ['RILY', 'SKHY', 'ASTS', 'LRCX', 'QCOM', 'CWBHF'];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      width: '250px',
      backgroundColor: '#131720',
      borderRight: '1px solid #232A38',
      padding: '20px',
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <h2 style={{ color: '#D4A574', marginBottom: '40px', fontSize: '16px' }}>📊 BRIEFING</h2>

      {/* Overview */}
      <div style={{ marginBottom: '30px' }}>
        <p style={{ color: '#7C8494', fontSize: '12px', marginBottom: '10px' }}>OVERVIEW</p>
        <Link to="/" style={{
          display: 'block',
          color: isActive('/') ? '#D4A574' : '#E8EAED',
          textDecoration: 'none',
          padding: '8px 12px',
          borderLeft: isActive('/') ? '2px solid #D4A574' : 'none',
          marginBottom: '8px',
        }}>
          Dashboard
        </Link>
      </div>

      {/* Tickers */}
      <div style={{ marginBottom: '30px' }}>
        <p style={{ color: '#7C8494', fontSize: '12px', marginBottom: '10px' }}>TICKERS</p>
        {tickers.map((ticker) => (
          <Link key={ticker} to={`/ticker/${ticker}`} style={{
            display: 'block',
            color: isActive(`/ticker/${ticker}`) ? '#D4A574' : '#E8EAED',
            textDecoration: 'none',
            padding: '8px 12px',
            borderLeft: isActive(`/ticker/${ticker}`) ? '2px solid #D4A574' : 'none',
            marginBottom: '8px',
            fontFamily: 'IBM Plex Mono, monospace',
          }}>
            {ticker}
          </Link>
        ))}
      </div>

      {/* Reference */}
      <div>
        <p style={{ color: '#7C8494', fontSize: '12px', marginBottom: '10px' }}>REFERENCE</p>
        <Link to="/glossary" style={{
          display: 'block',
          color: isActive('/glossary') ? '#D4A574' : '#E8EAED',
          textDecoration: 'none',
          padding: '8px 12px',
          borderLeft: isActive('/glossary') ? '2px solid #D4A574' : 'none',
          marginBottom: '8px',
        }}>
          Glossary
        </Link>
      </div>
    </div>
  );
}
