import React from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert, useTheme, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import api from '../services/api';
import ExpenseChart from '../components/charts/ExpenseChart';
import { Download } from 'lucide-react';

const TripVolumeChart: React.FC<{ trips: any[] }> = ({ trips }) => {
  const theme = useTheme();
  
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
        <Typography sx={{ color: theme.palette.text.secondary }}>No trip data available for chart.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={aggregated} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
          <XAxis dataKey="name" stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
          <YAxis stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
          <RechartsTooltip 
            cursor={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}`, borderRadius: '8px' }}
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

  const theme = useTheme();

  const handleDownloadCSV = () => {
    if (!expensesRes || !tripsRes) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "--- Expense Report ---\n";
    csvContent += "Type,Amount,Date,Notes\n";
    expensesRes.forEach((exp: any) => {
      csvContent += `${exp.type},${exp.amount},${new Date(exp.date).toLocaleDateString('en-IN')},"${(exp.notes || '').replace(/"/g, '""')}"\n`;
    });
    
    csvContent += "\n--- Trip Report ---\n";
    csvContent += "Source,Destination,Status,Departure Time\n";
    tripsRes.forEach((trip: any) => {
      csvContent += `"${trip.source}","${trip.destination}",${trip.status},${new Date(trip.departureTime).toLocaleDateString('en-IN')}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transitops_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
            Analytical Reports
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, mt: 1 }}>
            Comprehensive visualization of fleet financial and operational metrics.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Download size={18} />}
          onClick={handleDownloadCSV}
          disabled={isLoading}
          sx={{
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
          }}
        >
          Download CSV
        </Button>
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
            <Paper className="glass-panel" sx={{ p: 3, bgcolor: 'transparent', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Expense Distribution Breakdown
              </Typography>
              <ExpenseChart data={expensesRes || []} />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper className="glass-panel" sx={{ p: 3, bgcolor: 'transparent', borderRadius: 2 }}>
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
