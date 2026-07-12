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
import { Trip } from '../tables/TripTable';

interface TripFormProps {
  initialData?: Trip | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  error?: string;
}

const TripForm: React.FC<TripFormProps> = ({ initialData, onSubmit, onCancel, error }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [status, setStatus] = useState('SCHEDULED');
  const [driverId, setDriverId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const editMode = !!initialData;

  // Fetch available drivers
  const { data: driversRes, isLoading: loadingDrivers } = useQuery({
    queryKey: ['available-drivers'],
    queryFn: async () => {
      const res = await api.get('/drivers', { params: { limit: 100, status: 'AVAILABLE' } });
      return res.data.data;
    }
  });

  // Fetch available vehicles
  const { data: vehiclesRes, isLoading: loadingVehicles } = useQuery({
    queryKey: ['available-vehicles'],
    queryFn: async () => {
      const res = await api.get('/vehicles', { params: { limit: 100, status: 'AVAILABLE' } });
      return res.data.data;
    }
  });

  useEffect(() => {
    if (initialData) {
      setSource(initialData.source);
      setDestination(initialData.destination);
      
      const depDate = new Date(initialData.departureTime);
      setDepartureTime(depDate.toISOString().slice(0, 16));
      
      if (initialData.arrivalTime) {
        const arrDate = new Date(initialData.arrivalTime);
        setArrivalTime(arrDate.toISOString().slice(0, 16));
      } else {
        setArrivalTime('');
      }

      setStatus(initialData.status);
      setDriverId((initialData as any).driverId || '');
      setVehicleId((initialData as any).vehicleId || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      source,
      destination,
      departureTime: new Date(departureTime).toISOString(),
      arrivalTime: arrivalTime ? new Date(arrivalTime).toISOString() : undefined,
      status,
      driverId,
      vehicleId,
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Route Origin"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Route Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Departure Time"
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Arrival Time (Optional)"
              type="datetime-local"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Assigned Driver</InputLabel>
              <Select value={driverId} onChange={(e) => setDriverId(e.target.value)} label="Assigned Driver">
                {loadingDrivers ? (
                  <MenuItem value="" disabled><CircularProgress size={20} /></MenuItem>
                ) : (
                  (driversRes || []).map((d: any) => (
                    <MenuItem key={d.id} value={d.id}>{d.name} ({d.licenseNumber})</MenuItem>
                  ))
                )}
                {editMode && initialData && (initialData as any).driverId && !(driversRes || []).find((d: any) => d.id === (initialData as any).driverId) && (
                   <MenuItem value={(initialData as any).driverId}>(Current Driver)</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Assigned Vehicle</InputLabel>
              <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} label="Assigned Vehicle">
                {loadingVehicles ? (
                  <MenuItem value="" disabled><CircularProgress size={20} /></MenuItem>
                ) : (
                  (vehiclesRes || []).map((v: any) => (
                    <MenuItem key={v.id} value={v.id}>{v.registrationNumber} ({v.type})</MenuItem>
                  ))
                )}
                {editMode && initialData && (initialData as any).vehicleId && !(vehiclesRes || []).find((v: any) => v.id === (initialData as any).vehicleId) && (
                   <MenuItem value={(initialData as any).vehicleId}>(Current Vehicle)</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          {editMode && (
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
                  <MenuItem value="SCHEDULED">SCHEDULED</MenuItem>
                  <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                  <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                  <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Button onClick={onCancel} disabled={loading} sx={{ color: 'text.secondary' }}>Cancel</Button>
        <Button type="submit" disabled={loading} variant="contained" sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}>
          Save Trip
        </Button>
      </DialogActions>
    </form>
  );
};

export default TripForm;
