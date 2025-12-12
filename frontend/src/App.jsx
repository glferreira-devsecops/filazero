import { lazy, useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import DemoModeBadge from './components/DemoModeBadge';
import ErrorBoundary from './components/ErrorBoundary';
import RequireAuth from './components/RequireAuth';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { isDemoMode, preSeedDemoData } from './utils/demoUtils';

// Eagerly loaded (public routes - fast initial render)
import Landing from './pages/Landing';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import TicketStatus from './pages/TicketStatus';

// Lazy loaded (protected routes - code splitting)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reception = lazy(() => import('./pages/Reception'));
const RoomPanel = lazy(() => import('./pages/RoomPanel'));
const Settings = lazy(() => import('./pages/Settings'));
const Reports = lazy(() => import('./pages/Reports'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-slate-400 text-sm">Carregando...</p>
    </div>
  </div>
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('✅ Service Worker registered'))
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
        <SettingsProvider>
          <ToastProvider>
            <Router>
              <div id="main-content">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Routes (eagerly loaded) */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/clinic/:clinicId" element={<TicketStatus />} />

                    {/* Protected Routes (lazy loaded) */}
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
                </Suspense>
              </div>

              {/* Demo Mode Indicator - only visible when logged as guest */}
              <DemoModeBadge />
            </Router>
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
