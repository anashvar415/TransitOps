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
  Alert,
} from '@mui/material';
import { Plus, Search } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TripTable, { Trip } from '../components/tables/TripTable';
import TripForm from '../components/forms/TripForm';

const Trips: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const canEdit = user?.role === 'FLEET_MANAGER' || user?.role === 'SAFETY_OFFICER';
  const queryClient = useQueryClient();

  // Table params
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [formError, setFormError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['trips', page, rowsPerPage, search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/trips', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter || undefined,
        },
      });
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (selectedTrip) {
        return await api.put(`/trips/${selectedTrip.id}`, payload);
      } else {
        return await api.post('/trips', payload);
      }
    },
    onSuccess: () => {
      setDialogOpen(false);
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      // Invalidate available pools
      queryClient.invalidateQueries({ queryKey: ['available-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['available-vehicles'] });
      showToast(selectedTrip ? 'Trip updated successfully' : 'Trip dispatched successfully');
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error || 'Validation error saving trip');
      showToast('Failed to save trip', 'error');
    }
  });

  const handleOpenCreateDialog = () => {
    setSelectedTrip(null);
    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (trip: Trip) => {
    setSelectedTrip(trip);
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async (payload: any) => {
    await saveMutation.mutateAsync(payload);
  };

  const filteredTrips = (data?.data || []).filter((t: Trip) => 
    (t.source || '').toLowerCase().includes(search.toLowerCase()) || 
    (t.destination || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
          Trip Dispatching
        </Typography>
        {canEdit && (
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
            Dispatch Trip
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{(error as any).response?.data?.error || 'Failed to fetch trips'}</Alert>}

      {/* Filter and Search Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }} className="glass-panel" style={{ padding: '16px' }}>
        <TextField
          size="small"
          placeholder="Search Route Origin/Dest..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <Search size={16} style={{ color: '#9ca3af', marginRight: '8px' }} />,
          }}
          sx={{ minWidth: 260 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="SCHEDULED">SCHEDULED</MenuItem>
            <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
            <MenuItem value="CANCELLED">CANCELLED</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Trips Table */}
      <TripTable
        trips={filteredTrips}
        total={data?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        canEdit={canEdit}
        isLoading={isLoading}
        onPageChange={setPage}
        onRowsPerPageChange={(newRows) => { setRowsPerPage(newRows); setPage(0); }}
        onEdit={handleOpenEditDialog}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: 'text.primary', bgcolor: 'background.paper' }}>
          {selectedTrip ? 'Edit Trip Status' : 'Dispatch New Trip'}
        </DialogTitle>
        <TripForm 
          initialData={selectedTrip}
          onSubmit={handleSave}
          onCancel={() => setDialogOpen(false)}
          error={formError}
        />
      </Dialog>
    </Box>
  );
};

export default Trips;
