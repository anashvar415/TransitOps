import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Plus } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MaintenanceTable, { MaintenanceRecord } from '../components/tables/MaintenanceTable';
import MaintenanceForm from '../components/forms/MaintenanceForm';

const Maintenance: React.FC = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'FLEET_MANAGER';
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [formError, setFormError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['maintenance', page, rowsPerPage, statusFilter],
    queryFn: async () => {
      const res = await api.get('/maintenance', {
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
      if (selectedRecord) {
        return await api.put(`/maintenance/${selectedRecord.id}`, payload);
      } else {
        return await api.post('/maintenance', payload);
      }
    },
    onSuccess: () => {
      setDialogOpen(false);
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['all-vehicles'] });
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error || 'Validation error saving maintenance record');
    }
  });

  const handleOpenCreateDialog = () => {
    setSelectedRecord(null);
    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async (payload: any) => {
    await saveMutation.mutateAsync(payload);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
          Maintenance Log
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
            Log Maintenance
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{(error as any).response?.data?.error || 'Failed to fetch maintenance records'}</Alert>}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }} className="glass-panel" style={{ padding: '16px' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Filter by Status">
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="SCHEDULED">SCHEDULED</MenuItem>
            <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <MaintenanceTable
          records={data?.data || []}
          total={data?.total || 0}
          page={page}
          rowsPerPage={rowsPerPage}
          canEdit={canEdit}
          onPageChange={setPage}
          onRowsPerPageChange={(newRows) => { setRowsPerPage(newRows); setPage(0); }}
          onEdit={handleOpenEditDialog}
        />
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: 'text.primary', bgcolor: 'background.paper' }}>
          {selectedRecord ? 'Update Maintenance Status' : 'Log Maintenance Issue'}
        </DialogTitle>
        <MaintenanceForm 
          initialData={selectedRecord}
          onSubmit={handleSave}
          onCancel={() => setDialogOpen(false)}
          error={formError}
        />
      </Dialog>
    </Box>
  );
};

export default Maintenance;
