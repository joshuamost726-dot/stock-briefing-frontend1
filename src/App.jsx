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
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ticker/:ticker" element={<div>Ticker Detail (coming soon)</div>} />
            <Route path="/glossary" element={<div>Glossary (coming soon)</div>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
