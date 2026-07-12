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
  Alert
} from '@mui/material';
import { Vehicle } from '../tables/VehicleTable';

interface VehicleFormProps {
  initialData?: Vehicle | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  error?: string;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ initialData, onSubmit, onCancel, error }) => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Van');
  const [maxLoadCapacityKg, setMaxLoadCapacityKg] = useState('');
  const [odometerKm, setOdometerKm] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [loading, setLoading] = useState(false);

  const editMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setRegistrationNumber(initialData.registrationNumber);
      setName(initialData.name);
      setType(initialData.type);
      setMaxLoadCapacityKg(initialData.maxLoadCapacityKg.toString());
      setOdometerKm(initialData.odometerKm.toString());
      setAcquisitionCost(initialData.acquisitionCost.toString());
      setRegion(initialData.region);
      setStatus(initialData.status);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      registrationNumber,
      name,
      type,
      maxLoadCapacityKg: Number(maxLoadCapacityKg),
      odometerKm: Number(odometerKm),
      acquisitionCost: Number(acquisitionCost),
      region,
      status,
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent sx={{ bgcolor: '#161823', color: '#f3f4f6' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
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
        <Button onClick={onCancel} disabled={loading} sx={{ color: '#9ca3af' }}>Cancel</Button>
        <Button type="submit" disabled={loading} variant="contained" sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}>
          Save Vehicle
        </Button>
      </DialogActions>
    </form>
  );
};

export default VehicleForm;
