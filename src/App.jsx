import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles.css';

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar placeholder */}
        <div style={{ width: '250px', backgroundColor: '#0B0E14', borderRight: '1px solid #232A38' }}>
          <p style={{ color: '#E8EAED', padding: '20px' }}>Sidebar (coming soon)</p>
        </div>
        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0B0E14' }}>
          <Routes>
            <Route path="/" element={<div style={{ color: '#E8EAED', padding: '20px' }}>Dashboard</div>} />
            <Route path="/ticker/:ticker" element={<div style={{ color: '#E8EAED', padding: '20px' }}>Ticker Detail</div>} />
            <Route path="/glossary" element={<div style={{ color: '#E8EAED', padding: '20px' }}>Glossary</div>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
