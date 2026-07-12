import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Plus, Search } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import VehicleTable, { Vehicle } from '../components/tables/VehicleTable';
import VehicleForm from '../components/forms/VehicleForm';

const Vehicles: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'FLEET_MANAGER';
  const queryClient = useQueryClient();

  // Table pagination and filters
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formError, setFormError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicles', page, rowsPerPage, search, statusFilter, typeFilter],
    queryFn: async () => {
      const res = await api.get('/vehicles', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter || undefined,
          type: typeFilter || undefined,
          region: search || undefined,
        },
      });
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (selectedVehicle) {
        return await api.put(`/vehicles/${selectedVehicle.id}`, payload);
      } else {
        return await api.post('/vehicles', payload);
      }
    },
    onSuccess: () => {
      setDialogOpen(false);
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error || 'Validation error saving vehicle');
    }
  });

  const retireMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const handleOpenCreateDialog = () => {
    setSelectedVehicle(null);
    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async (payload: any) => {
    await saveMutation.mutateAsync(payload);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to retire this vehicle? This will set its status to RETIRED.')) {
      await retireMutation.mutateAsync(id);
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

      {error && <Alert severity="error" sx={{ mb: 3 }}>{(error as any).response?.data?.error || 'Failed to fetch vehicles'}</Alert>}

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
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <VehicleTable
          vehicles={data?.data || []}
          total={data?.total || 0}
          page={page}
          rowsPerPage={rowsPerPage}
          isManager={isManager}
          onPageChange={setPage}
          onRowsPerPageChange={(newRows) => { setRowsPerPage(newRows); setPage(0); }}
          onEdit={handleOpenEditDialog}
          onRetire={handleDelete}
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: 'text.primary', bgcolor: 'background.paper' }}>
          {selectedVehicle ? 'Edit Vehicle Profile' : 'Register New Vehicle'}
        </DialogTitle>
        <VehicleForm 
          initialData={selectedVehicle} 
          onSubmit={handleSave} 
          onCancel={() => setDialogOpen(false)} 
          error={formError} 
        />
      </Dialog>
    </Box>
  );
};

export default Vehicles;
