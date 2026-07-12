import React from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import api from '../services/api';
import ExpenseChart from '../components/charts/ExpenseChart';

const TripVolumeChart: React.FC<{ trips: any[] }> = ({ trips }) => {
  const aggregated = trips.reduce((acc, curr) => {
    const existing = acc.find((item: any) => item.name === curr.status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: curr.status, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  if (aggregated.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography sx={{ color: '#9ca3af' }}>No trip data available for chart.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={aggregated} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <RechartsTooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ backgroundColor: '#161823', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
            itemStyle={{ color: '#8b5cf6' }}
          />
          <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

const Reports: React.FC = () => {
  const { data: expensesRes, isLoading: loadingExpenses, error: expensesError } = useQuery({
    queryKey: ['reports-expenses'],
    queryFn: async () => {
      const res = await api.get('/expenses', { params: { limit: 1000 } });
      return res.data?.data || [];
    }
  });

  const { data: tripsRes, isLoading: loadingTrips, error: tripsError } = useQuery({
    queryKey: ['reports-trips'],
    queryFn: async () => {
      const res = await api.get('/trips', { params: { limit: 1000 } });
      return res.data?.data || [];
    }
  });

  const isLoading = loadingExpenses || loadingTrips;
  const error = expensesError || tripsError;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
          Analytical Reports
        </Typography>
        <Typography sx={{ color: '#9ca3af', mt: 1 }}>
          Comprehensive visualization of fleet financial and operational metrics.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load report data. Please ensure the backend is running.
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper className="glass-panel" sx={{ p: 3, bgcolor: 'rgba(22, 24, 35, 0.4)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Expense Distribution Breakdown
              </Typography>
              <ExpenseChart data={expensesRes || []} />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper className="glass-panel" sx={{ p: 3, bgcolor: 'rgba(22, 24, 35, 0.4)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Trip Volume by Status
              </Typography>
              <TripVolumeChart trips={tripsRes || []} />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Reports;
