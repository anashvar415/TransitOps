import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  TablePagination,
} from '@mui/material';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  status: string;
  region: string;
}

const Vehicles: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isManager = user.role === 'FLEET_MANAGER';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Table pagination and filters
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Form states
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Van');
  const [maxLoadCapacityKg, setMaxLoadCapacityKg] = useState('');
  const [odometerKm, setOdometerKm] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [validationError, setValidationError] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter || undefined,
          type: typeFilter || undefined,
          region: search || undefined, // use search text to filter by region
        },
      });
      setVehicles(res.data.data);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, rowsPerPage, statusFilter, typeFilter, search]);

  const handleOpenCreateDialog = () => {
    setEditMode(false);
    setSelectedVehicleId(null);
    setRegistrationNumber('');
    setName('');
    setType('Van');
    setMaxLoadCapacityKg('');
    setOdometerKm('');
    setAcquisitionCost('');
    setRegion('');
    setStatus('AVAILABLE');
    setValidationError('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (vehicle: Vehicle) => {
    setEditMode(true);
    setSelectedVehicleId(vehicle.id);
    setRegistrationNumber(vehicle.registrationNumber);
    setName(vehicle.name);
    setType(vehicle.type);
    setMaxLoadCapacityKg(vehicle.maxLoadCapacityKg.toString());
    setOdometerKm(vehicle.odometerKm.toString());
    setAcquisitionCost(vehicle.acquisitionCost.toString());
    setRegion(vehicle.region);
    setStatus(vehicle.status);
    setValidationError('');
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const payload = {
      registrationNumber,
      name,
      type,
      maxLoadCapacityKg: Number(maxLoadCapacityKg),
      odometerKm: Number(odometerKm),
      acquisitionCost: Number(acquisitionCost),
      region,
      status,
    };

    try {
      if (editMode && selectedVehicleId) {
        await api.put(`/vehicles/${selectedVehicleId}`, payload);
      } else {
        await api.post('/vehicles', payload);
      }
      setDialogOpen(false);
      fetchVehicles();
    } catch (err: any) {
      setValidationError(err.response?.data?.error || 'Validation error saving vehicle');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to retire this vehicle? This will set its status to RETIRED.')) {
      try {
        await api.delete(`/vehicles/${id}`);
        fetchVehicles();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to retire vehicle');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
          Vehicle Registry
        </Typography>
        {isManager && (
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={handleOpenCreateDialog}
            sx={{
              bgcolor: '#8b5cf6',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              '&:hover': { bgcolor: '#7c3aed' },
            }}
          >
            Add Vehicle
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Filter and Search Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }} className="glass-panel" style={{ padding: '16px' }}>
        <TextField
          size="small"
          placeholder="Search by Region..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <Search size={16} style={{ color: '#9ca3af', marginRight: '8px' }} />,
          }}
          sx={{ minWidth: 240 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
            <MenuItem value="ON_TRIP">ON_TRIP</MenuItem>
            <MenuItem value="IN_SHOP">IN_SHOP</MenuItem>
            <MenuItem value="RETIRED">RETIRED</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type">
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="Van">Van</MenuItem>
            <MenuItem value="Truck">Truck</MenuItem>
            <MenuItem value="Bike">Bike</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Vehicles Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} className="glass-panel" sx={{ bgcolor: 'rgba(22, 24, 35, 0.4)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { color: '#9ca3af', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)' } }}>
                <TableCell>Reg. Number</TableCell>
                <TableCell>Name/Model</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Capacity (kg)</TableCell>
                <TableCell>Odometer (km)</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Status</TableCell>
                {isManager && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((v) => (
                <TableRow key={v.id} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f3f4f6' } }}>
                  <TableCell style={{ fontWeight: 600 }}>{v.registrationNumber}</TableCell>
                  <TableCell>{v.name}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>{Number(v.maxLoadCapacityKg).toLocaleString()}</TableCell>
                  <TableCell>{Number(v.odometerKm).toLocaleString()}</TableCell>
                  <TableCell>{v.region}</TableCell>
                  <TableCell><StatusBadge status={v.status} /></TableCell>
                  {isManager && (
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenEditDialog(v)} sx={{ color: '#9ca3af', '&:hover': { color: '#8b5cf6' } }}>
                          <Edit size={16} />
                        </IconButton>
                      </Tooltip>
                      {v.status !== 'RETIRED' && (
                        <Tooltip title="Retire">
                          <IconButton size="small" onClick={() => handleDelete(v.id)} sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444' } }}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {vehicles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isManager ? 8 : 7} align="center" sx={{ py: 6, color: '#6b7280' }}>
                    No vehicles found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{ color: '#9ca3af', borderTop: '1px solid rgba(255,255,255,0.08)' }}
          />
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#f3f4f6', bgcolor: '#161823' }}>
          {editMode ? 'Edit Vehicle Profile' : 'Register New Vehicle'}
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent sx={{ bgcolor: '#161823', color: '#f3f4f6' }}>
            {validationError && <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Registration Number"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  required
                  disabled={editMode}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name / Model"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Type</InputLabel>
                  <Select value={type} onChange={(e) => setType(e.target.value)} label="Type">
                    <MenuItem value="Van">Van</MenuItem>
                    <MenuItem value="Truck">Truck</MenuItem>
                    <MenuItem value="Bike">Bike</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Load Capacity (kg)"
                  type="number"
                  value={maxLoadCapacityKg}
                  onChange={(e) => setMaxLoadCapacityKg(e.target.value)}
                  required
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Odometer (km)"
                  type="number"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  required
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Acquisition Cost ($)"
                  type="number"
                  value={acquisitionCost}
                  onChange={(e) => setAcquisitionCost(e.target.value)}
                  required
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                  margin="dense"
                />
              </Grid>
              {editMode && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Status</InputLabel>
                    <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
                      <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
                      <MenuItem value="ON_TRIP">ON_TRIP</MenuItem>
                      <MenuItem value="IN_SHOP">IN_SHOP</MenuItem>
                      <MenuItem value="RETIRED">RETIRED</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#161823' }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ color: '#9ca3af' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}>
              Save Vehicle
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Vehicles;
