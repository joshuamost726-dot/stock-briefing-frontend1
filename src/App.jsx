import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import Dashboard from './pages/Dashboard';
import './styles.css';

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0B0E14' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ticker/:ticker" element={<div style={{ color: '#E8EAED', padding: '20px' }}>Ticker Detail (coming soon)</div>} />
            <Route path="/glossary" element={<div style={{ color: '#E8EAED', padding: '20px' }}>Glossary (coming soon)</div>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
