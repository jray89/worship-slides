import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ServiceListPage from './pages/ServiceListPage';
import ServiceEditPage from './pages/ServiceEditPage';
import ServicePreviewPage from './pages/ServicePreviewPage';
import PrintSlidesView from './components/PrintSlidesView';
import PrintTitleCardView from './components/PrintTitleCardView';
import './index.css';

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/services" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/services" element={<ServiceListPage />} />
          <Route path="/services/:id/edit" element={<ServiceEditPage />} />
          <Route path="/services/:id/preview" element={<ServicePreviewPage />} />
        </Route>
        <Route path="/services/:id/print/slides" element={<PrintSlidesView />} />
        <Route path="/services/:id/print/title_card" element={<PrintTitleCardView />} />
      </Routes>
    </BrowserRouter>
  );
}
