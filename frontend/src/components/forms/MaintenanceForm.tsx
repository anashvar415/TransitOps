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
import { MaintenanceRecord } from '../tables/MaintenanceTable';

interface MaintenanceFormProps {
  initialData?: MaintenanceRecord | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  error?: string;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ initialData, onSubmit, onCancel, error }) => {
  const [vehicleId, setVehicleId] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [dateReported, setDateReported] = useState('');
  const [dateResolved, setDateResolved] = useState('');
  const [status, setStatus] = useState('SCHEDULED');
  
  const [loading, setLoading] = useState(false);
  const editMode = !!initialData;

  const { data: vehiclesRes, isLoading: loadingVehicles } = useQuery({
    queryKey: ['all-vehicles'],
    queryFn: async () => {
      const res = await api.get('/vehicles', { params: { limit: 1000 } });
      return res.data.data;
    }
  });

  useEffect(() => {
    if (initialData) {
      setVehicleId(initialData.vehicleId);
      setDescription(initialData.description);
      setCost(initialData.cost.toString());
      
      const repDate = new Date(initialData.dateReported);
      setDateReported(repDate.toISOString().split('T')[0]);
      
      if (initialData.dateResolved) {
        const resDate = new Date(initialData.dateResolved);
        setDateResolved(resDate.toISOString().split('T')[0]);
      } else {
        setDateResolved('');
      }

      setStatus(initialData.status);
    } else {
      setDateReported(new Date().toISOString().split('T')[0]);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      vehicleId,
      description,
      cost: Number(cost),
      dateReported: new Date(dateReported).toISOString(),
      dateResolved: dateResolved ? new Date(dateResolved).toISOString() : undefined,
      status,
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent sx={{ bgcolor: '#161823', color: '#f3f4f6' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Vehicle</InputLabel>
              <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} label="Vehicle" disabled={editMode}>
                {loadingVehicles ? (
                  <MenuItem value="" disabled><CircularProgress size={20} /></MenuItem>
                ) : (
                  (vehiclesRes || []).map((v: any) => (
                    <MenuItem key={v.id} value={v.id}>{v.registrationNumber} ({v.name})</MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description of Maintenance"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              multiline
              rows={3}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cost ($)"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date Reported"
              type="date"
              value={dateReported}
              onChange={(e) => setDateReported(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              margin="dense"
            />
          </Grid>
          
          {editMode && (
            <>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Status</InputLabel>
                  <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
                    <MenuItem value="SCHEDULED">SCHEDULED</MenuItem>
                    <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                    <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date Resolved (Optional)"
                  type="date"
                  value={dateResolved}
                  onChange={(e) => setDateResolved(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  margin="dense"
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: '#161823' }}>
        <Button onClick={onCancel} disabled={loading} sx={{ color: '#9ca3af' }}>Cancel</Button>
        <Button type="submit" disabled={loading} variant="contained" sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}>
          Save Record
        </Button>
      </DialogActions>
    </form>
  );
};

export default MaintenanceForm;
