import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from '../App';
import PrintSlidesView from '../components/PrintSlidesView';
import PrintTitleCardView from '../components/PrintTitleCardView';
import '../styles/application.css';

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <Routes>
        <Route path="/print/:id/slides" element={<PrintSlidesView />} />
        <Route path="/print/:id/title_card" element={<PrintTitleCardView />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}
