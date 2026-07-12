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
import ExpenseTable, { ExpenseRecord } from '../components/tables/ExpenseTable';
import ExpenseForm from '../components/forms/ExpenseForm';

const Expenses: React.FC = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'FLEET_MANAGER' || user?.role === 'FINANCIAL_ANALYST';
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ExpenseRecord | null>(null);
  const [formError, setFormError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses', page, rowsPerPage, categoryFilter],
    queryFn: async () => {
      const res = await api.get('/expenses', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          type: categoryFilter || undefined,
        },
      });
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (selectedRecord) {
        return await api.put(`/expenses/${selectedRecord.id}`, payload);
      } else {
        return await api.post('/expenses', payload);
      }
    },
    onSuccess: () => {
      setDialogOpen(false);
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Refresh dashboard metrics
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error || 'Validation error saving expense');
    }
  });

  const handleOpenCreateDialog = () => {
    setSelectedRecord(null);
    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (record: ExpenseRecord) => {
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
          Fuel & Expenses
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
            Add Expense
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{(error as any).response?.data?.error || 'Failed to fetch expenses'}</Alert>}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }} className="glass-panel" style={{ padding: '16px' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} label="Filter by Category">
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="FUEL">FUEL</MenuItem>
            <MenuItem value="MAINTENANCE">MAINTENANCE</MenuItem>
            <MenuItem value="SALARY">SALARY</MenuItem>
            <MenuItem value="TOLL">TOLL</MenuItem>
            <MenuItem value="INSURANCE">INSURANCE</MenuItem>
            <MenuItem value="OTHER">OTHER</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ExpenseTable
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
        <DialogTitle sx={{ fontWeight: 600, color: '#f3f4f6', bgcolor: '#161823' }}>
          {selectedRecord ? 'Update Expense Record' : 'Log New Expense'}
        </DialogTitle>
        <ExpenseForm 
          initialData={selectedRecord}
          onSubmit={handleSave}
          onCancel={() => setDialogOpen(false)}
          error={formError}
        />
      </Dialog>
    </Box>
  );
};

export default Expenses;
