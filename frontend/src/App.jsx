import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Reception from './pages/Reception';
import RoomPanel from './pages/RoomPanel';
import TicketStatus from './pages/TicketStatus';

import { ToastProvider } from './context/ToastContext';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
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
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
