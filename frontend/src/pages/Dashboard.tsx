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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import api from '../services/api';

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
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [utilizationTrend, setUtilizationTrend] = useState<any[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  const fetchDashboardData = async () => {
    try {
      const params: any = {};
      if (typeFilter) params.type = typeFilter;
      if (regionFilter) params.region = regionFilter;

      const [kpisRes, trendRes, costRes] = await Promise.all([
        api.get('/dashboard/kpis', { params }),
        api.get('/reports/fleet-utilization'),
        api.get('/reports/operational-cost'),
      ]);

      setKpis(kpisRes.data);
      setUtilizationTrend(trendRes.data);
      setCostBreakdown(costRes.data.slice(0, 5)); // top 5 vehicles
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
    return <Alert severity="error">{error}</Alert>;
  }

  const kpiList = [
    { title: 'Active Vehicles', value: kpis?.activeVehicles, icon: <Truck size={24} color="#3b82f6" />, desc: 'Vehicles currently on trip' },
    { title: 'Available Vehicles', value: kpis?.availableVehicles, icon: <CheckCircle2 size={24} color="#10b981" />, desc: 'Vehicles ready to deploy' },
    { title: 'In Maintenance', value: kpis?.vehiclesInMaintenance, icon: <AlertTriangle size={24} color="#f59e0b" />, desc: 'Vehicles in shop' },
    { title: 'Active Trips', value: kpis?.activeTrips, icon: <MapPin size={24} color="#06b6d4" />, desc: 'Active dispatched trips' },
    { title: 'Pending Trips', value: kpis?.pendingTrips, icon: <CalendarRange size={24} color="#8b5cf6" />, desc: 'Trips in draft' },
    { title: 'Drivers On Duty', value: kpis?.driversOnDuty, icon: <Users2 size={24} color="#ec4899" />, desc: 'Available & active drivers' },
    { title: 'Fleet Utilization', value: `${kpis?.fleetUtilization}%`, icon: <TrendingUp size={24} color="#a855f7" />, desc: 'Active / non-retired vehicles' },
  ];

  return (
    <Box>
      {/* Filter controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }} className="glass-panel" style={{ padding: '16px' }}>
        <Typography variant="subtitle1" sx={{ alignSelf: 'center', fontWeight: 600, color: '#f3f4f6', mr: 2 }}>
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
            <Card className="glass-panel" sx={{ bgcolor: 'rgba(22, 24, 35, 0.6)', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    {kpi.title}
                  </Typography>
                  {kpi.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Outfit, sans-serif' }}>
                  {kpi.value}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {kpi.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Fleet Utilization Trend */}
        <Grid item xs={12} lg={6}>
          <Card className="glass-panel" sx={{ bgcolor: 'rgba(22, 24, 35, 0.6)', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontSize: '1rem', color: '#f3f4f6' }}>
                Fleet Utilization Trend (%)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={utilizationTrend}>
                    <defs>
                      <linearGradient id="utilizationColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                    <ChartTooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Area type="monotone" dataKey="utilization" stroke="#8b5cf6" fillOpacity={1} fill="url(#utilizationColor)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Cost Breakdown per Vehicle */}
        <Grid item xs={12} lg={6}>
          <Card className="glass-panel" sx={{ bgcolor: 'rgba(22, 24, 35, 0.6)', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontSize: '1rem', color: '#f3f4f6' }}>
                Vehicle Operational Costs Breakdown ($)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="registrationNumber" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <ChartTooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)' }} />
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
