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
import DriverTable, { Driver } from '../components/tables/DriverTable';
import DriverForm from '../components/forms/DriverForm';

const Drivers: React.FC = () => {
  const { user } = useAuth();
  const isSafetyOfficer = user?.role === 'SAFETY_OFFICER';
  const queryClient = useQueryClient();

  // Table params
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [formError, setFormError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['drivers', page, rowsPerPage, search, statusFilter, categoryFilter],
    queryFn: async () => {
      const res = await api.get('/drivers', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter || undefined,
          licenseCategory: categoryFilter || undefined,
        },
      });
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (selectedDriver) {
        return await api.put(`/drivers/${selectedDriver.id}`, payload);
      } else {
        return await api.post('/drivers', payload);
      }
    },
    onSuccess: () => {
      setDialogOpen(false);
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error || 'Validation error saving driver');
    }
  });

  const handleOpenCreateDialog = () => {
    setSelectedDriver(null);
    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async (payload: any) => {
    await saveMutation.mutateAsync(payload);
  };

  const filteredDrivers = (data?.data || []).filter((d: Driver) => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.licenseNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
          Driver Management
        </Typography>
        {isSafetyOfficer && (
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
            Register Driver
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{(error as any).response?.data?.error || 'Failed to fetch drivers'}</Alert>}

      {/* Filter and Search Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }} className="glass-panel" style={{ padding: '16px' }}>
        <TextField
          size="small"
          placeholder="Search by Name or License..."
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
            <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
            <MenuItem value="ON_TRIP">ON_TRIP</MenuItem>
            <MenuItem value="OFF_DUTY">OFF_DUTY</MenuItem>
            <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>License Category</InputLabel>
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} label="License Category">
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="A">Class A CDL</MenuItem>
            <MenuItem value="B">Class B CDL</MenuItem>
            <MenuItem value="C">Class C CDL</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Drivers Table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DriverTable
          drivers={filteredDrivers}
          total={data?.total || 0}
          page={page}
          rowsPerPage={rowsPerPage}
          isSafetyOfficer={isSafetyOfficer}
          onPageChange={setPage}
          onRowsPerPageChange={(newRows) => { setRowsPerPage(newRows); setPage(0); }}
          onEdit={handleOpenEditDialog}
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: 'text.primary', bgcolor: 'background.paper' }}>
          {selectedDriver ? 'Edit Driver Profile' : 'Register New Driver'}
        </DialogTitle>
        <DriverForm 
          initialData={selectedDriver}
          onSubmit={handleSave}
          onCancel={() => setDialogOpen(false)}
          error={formError}
        />
      </Dialog>
    </Box>
  );
};

export default Drivers;
