import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ServiceListPage from './pages/ServiceListPage';
import ServiceEditPage from './pages/ServiceEditPage';
import ServicePreviewPage from './pages/ServicePreviewPage';
import LoginPage from './pages/LoginPage';
import PrintSlidesView from './components/PrintSlidesView';
import PrintTitleCardView from './components/PrintTitleCardView';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute, GuestRoute } from './components/RouteGuards';
import './index.css';

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/services" replace />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/services" element={<ServiceListPage />} />
            <Route path="/services/:id/edit" element={<ServiceEditPage />} />
            <Route path="/services/:id/preview" element={<ServicePreviewPage />} />
          </Route>
          <Route path="/services/:id/print/slides" element={<PrintSlidesView />} />
          <Route path="/services/:id/print/title_card" element={<PrintTitleCardView />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
