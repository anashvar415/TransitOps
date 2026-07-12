import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { ExpenseRecord } from '../tables/ExpenseTable';

interface ExpenseFormProps {
  initialData?: ExpenseRecord | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  error?: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, onSubmit, onCancel, error }) => {
  const [type, setType] = useState('FUEL');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Fetch lists for optional association
  const { data: vehiclesRes, isLoading: loadingVehicles } = useQuery({
    queryKey: ['all-vehicles'],
    queryFn: async () => {
      const res = await api.get('/vehicles', { params: { limit: 1000 } });
      return res.data.data;
    }
  });

  const { data: driversRes, isLoading: loadingDrivers } = useQuery({
    queryKey: ['all-drivers'],
    queryFn: async () => {
      const res = await api.get('/drivers', { params: { limit: 1000 } });
      return res.data.data;
    }
  });

  useEffect(() => {
    if (initialData) {
      setType((initialData as any).type);
      setAmount(initialData.amount.toString());
      setNotes((initialData as any).notes || '');
      
      const incDate = new Date((initialData as any).date);
      setDate(incDate.toISOString().split('T')[0]);
      
      setVehicleId(initialData.vehicleId || '');
      setDriverId(initialData.driverId || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      type,
      amount: Number(amount),
      date: new Date(date).toISOString(),
      notes,
      vehicleId: vehicleId || null,
      driverId: driverId || null,
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Category</InputLabel>
              <Select value={type} onChange={(e) => setType(e.target.value)} label="Category">
                <MenuItem value="FUEL">FUEL</MenuItem>
                <MenuItem value="MAINTENANCE">MAINTENANCE</MenuItem>
                <MenuItem value="SALARY">SALARY</MenuItem>
                <MenuItem value="TOLL">TOLL</MenuItem>
                <MenuItem value="INSURANCE">INSURANCE</MenuItem>
                <MenuItem value="OTHER">OTHER</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount (₹)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date Incurred"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Description"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Associated Vehicle (Optional)</InputLabel>
              <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} label="Associated Vehicle (Optional)">
                <MenuItem value=""><em>None</em></MenuItem>
                {loadingVehicles ? (
                  <MenuItem value="" disabled><CircularProgress size={20} /></MenuItem>
                ) : (
                  (vehiclesRes || []).map((v: any) => (
                    <MenuItem key={v.id} value={v.id}>{v.registrationNumber}</MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Associated Driver (Optional)</InputLabel>
              <Select value={driverId} onChange={(e) => setDriverId(e.target.value)} label="Associated Driver (Optional)">
                <MenuItem value=""><em>None</em></MenuItem>
                {loadingDrivers ? (
                  <MenuItem value="" disabled><CircularProgress size={20} /></MenuItem>
                ) : (
                  (driversRes || []).map((d: any) => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Button onClick={onCancel} disabled={loading} sx={{ color: 'text.secondary' }}>Cancel</Button>
        <Button type="submit" disabled={loading} variant="contained" sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}>
          Save Expense
        </Button>
      </DialogActions>
    </form>
  );
};

export default ExpenseForm;
