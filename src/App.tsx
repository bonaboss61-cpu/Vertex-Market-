import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import TradingApp from './TradingApp';
import Chatbot from './components/Chatbot';

export default function App() {
  return (
    <BrowserRouter>
      <Chatbot />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/trade" element={<TradingApp />} />
        <Route path="/admin" element={<TradingApp forceAdmin={true} />} />
      </Routes>
    </BrowserRouter>
  );
}
