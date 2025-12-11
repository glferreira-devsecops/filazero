import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import DemoModeBadge from './components/DemoModeBadge';
import RequireAuth from './components/RequireAuth';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Reception from './pages/Reception';
import Reports from './pages/Reports';
import RoomPanel from './pages/RoomPanel';
import Settings from './pages/Settings';
import TicketStatus from './pages/TicketStatus';

import { ToastProvider } from './context/ToastContext';

import { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { isDemoMode, preSeedDemoData } from './utils/demoUtils';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('✅ Service Worker registered'))
      .catch((err) => console.warn('⚠️ Service Worker failed:', err));
  });
}

function App() {
  // Auto-seed demo data on first load (only in demo mode)
  useEffect(() => {
    if (isDemoMode()) {
      preSeedDemoData('guest');
      preSeedDemoData('demo');
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/clinic/:clinicId" element={<TicketStatus />} />

              {/* Protected Routes */}
              <Route path="/admin" element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              } />
              <Route path="/reception" element={
                <RequireAuth>
                  <Reception />
                </RequireAuth>
              } />
              <Route path="/panel" element={
                <RequireAuth>
                  <RoomPanel />
                </RequireAuth>
              } />
              <Route path="/settings" element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              } />
              <Route path="/reports" element={
                <RequireAuth>
                  <Reports />
                </RequireAuth>
              } />

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Demo Mode Indicator - only visible when logged as guest */}
            <DemoModeBadge />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
