import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import RouteGuard from './components/RouteGuard';

// Import existing pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

const queryClient = new QueryClient();

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6', 
    },
    secondary: {
      main: '#6366f1',
    },
    background: {
      default: '#06070a',
      paper: '#161823',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route element={<RouteGuard />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                <Route element={<RouteGuard allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']} />}>
                  <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                  <Route path="/expenses" element={<Layout><Expenses /></Layout>} />
                  <Route path="/reports" element={<Layout><Reports /></Layout>} />
                </Route>
                
                <Route element={<RouteGuard allowedRoles={['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']} />}>
                  <Route path="/vehicles" element={<Layout><Vehicles /></Layout>} />
                  <Route path="/drivers" element={<Layout><Drivers /></Layout>} />
                  <Route path="/trips" element={<Layout><Trips /></Layout>} />
                </Route>

                <Route element={<RouteGuard allowedRoles={['FLEET_MANAGER']} />}>
                  <Route path="/maintenance" element={<Layout><Maintenance /></Layout>} />
                </Route>
              </Route>
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
