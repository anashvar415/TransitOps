import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
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

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
  mode: 'dark' as 'light' | 'dark',
});

function App() {
  const [mode, setMode] = React.useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', nextMode);
          return nextMode;
        });
      },
      mode,
    }),
    [mode]
  );

  React.useEffect(() => {
    if (mode === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [mode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#8b5cf6', 
          },
          secondary: {
            main: '#6366f1',
          },
          background: {
            default: mode === 'dark' ? '#06070a' : '#f3f4f6',
            paper: mode === 'dark' ? '#161823' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#f3f4f6' : '#111827',
            secondary: mode === 'dark' ? '#9ca3af' : '#4b5563',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        shape: {
          borderRadius: 8,
        },
      }),
    [mode]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastProvider>
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
        </ToastProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
