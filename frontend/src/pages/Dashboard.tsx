import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  CalendarRange,
  Users2,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import api from '../services/api';
import KPICard from '../components/KPICard';
import UtilizationChart from '../components/charts/UtilizationChart';

interface DashboardKPIs {
  activeVehicles: number;
  availableVehicles: number;
  vehiclesInMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilization: number;
}

interface CostBreakdown {
  registrationNumber: string;
  name: string;
  fuelCost: number;
  maintenanceCost: number;
  totalCost: number;
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [utilizationTrend, setUtilizationTrend] = useState<any[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter) params.type = typeFilter;
      if (regionFilter) params.region = regionFilter;

      const [kpisRes, trendRes, costRes] = await Promise.all([
        api.get('/dashboard/kpis', { params }),
        api.get('/reports/fleet-utilization'),
        api.get('/reports/operational-cost'),
      ]);

      setKpis(kpisRes.data as DashboardKPIs);
      setUtilizationTrend(trendRes.data);
      setCostBreakdown(costRes.data.slice(0, 5) as CostBreakdown[]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [typeFilter, regionFilter]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>;
  }

  const kpiList = [
    { title: 'Active Vehicles', value: kpis?.activeVehicles, icon: <Truck size={24} color="#3b82f6" />, desc: 'Vehicles currently on trip' },
    { title: 'Available Vehicles', value: kpis?.availableVehicles, icon: <CheckCircle2 size={24} color="#10b981" />, desc: 'Vehicles ready to deploy' },
    { title: 'In Maintenance', value: kpis?.vehiclesInMaintenance, icon: <AlertTriangle size={24} color="#f59e0b" />, desc: 'Vehicles in shop' },
    { title: 'Active Trips', value: kpis?.activeTrips, icon: <MapPin size={24} color="#06b6d4" />, desc: 'Active dispatched trips' },
    { title: 'Pending Trips', value: kpis?.pendingTrips, icon: <CalendarRange size={24} color="#8b5cf6" />, desc: 'Trips in draft' },
    { title: 'Drivers On Duty', value: kpis?.driversOnDuty, icon: <Users2 size={24} color="#ec4899" />, desc: 'Available & active drivers' },
    { title: 'Fleet Utilization', value: kpis ? `${kpis.fleetUtilization}%` : '-', icon: <TrendingUp size={24} color="#a855f7" />, desc: 'Active / non-retired vehicles' },
  ];

  return (
    <Box>
      {/* Filter controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }} className="glass-panel" style={{ padding: '16px' }}>
        <Typography variant="subtitle1" sx={{ alignSelf: 'center', fontWeight: 600, color: theme.palette.text.primary, mr: 2 }}>
          Filters
        </Typography>
        <FormControl sx={{ minWidth: 160 }} size="small">
          <InputLabel>Vehicle Type</InputLabel>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Vehicle Type">
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="Van">Van</MenuItem>
            <MenuItem value="Truck">Truck</MenuItem>
            <MenuItem value="Bike">Bike</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 160 }} size="small">
          <InputLabel>Region</InputLabel>
          <Select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} label="Region">
            <MenuItem value="">All Regions</MenuItem>
            <MenuItem value="North">North</MenuItem>
            <MenuItem value="South">South</MenuItem>
            <MenuItem value="East">East</MenuItem>
            <MenuItem value="West">West</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiList.map((kpi) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={kpi.title}>
            <KPICard title={kpi.title} value={kpi.value} icon={kpi.icon} desc={kpi.desc} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Fleet Utilization Trend */}
        <Grid item xs={12} lg={6}>
          <Card className="glass-panel" sx={{ bgcolor: 'transparent', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontSize: '1rem', color: theme.palette.text.primary }}>
                Fleet Utilization Trend (%)
              </Typography>
              <Box sx={{ height: 300 }}>
                <UtilizationChart data={utilizationTrend || []} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Cost Breakdown per Vehicle */}
        <Grid item xs={12} lg={6}>
          <Card className="glass-panel" sx={{ bgcolor: 'transparent', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontSize: '1rem', color: theme.palette.text.primary }}>
                Vehicle Operational Costs Breakdown ($)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="registrationNumber" stroke={theme.palette.text.secondary} fontSize={12} />
                    <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                    <ChartTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, borderColor: theme.palette.divider }} />
                    <Legend />
                    <Bar dataKey="fuelCost" name="Fuel Cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="maintenanceCost" name="Maintenance" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="otherExpenseCost" name="Other Expenses" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
