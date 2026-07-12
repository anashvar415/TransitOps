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
import { Driver } from '../tables/DriverTable';

interface DriverFormProps {
  initialData?: Driver | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  error?: string;
}

const DriverForm: React.FC<DriverFormProps> = ({ initialData, onSubmit, onCancel, error }) => {
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [safetyScore, setSafetyScore] = useState('100');
  const [status, setStatus] = useState('AVAILABLE');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const editMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLicenseNumber(initialData.licenseNumber);
      setLicenseCategory(initialData.licenseCategory);
      
      const date = new Date(initialData.licenseExpiryDate);
      const dateStr = date.toISOString().split('T')[0];
      setLicenseExpiryDate(dateStr);

      setContactNumber(initialData.contactNumber);
      setSafetyScore(initialData.safetyScore.toString());
      setStatus(initialData.status);
      setUserId(initialData.userId);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore: Number(safetyScore),
      status,
      userId: userId || null,
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
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="License Number"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              required
              disabled={editMode}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel>License Category</InputLabel>
              <Select value={licenseCategory} onChange={(e) => setLicenseCategory(e.target.value)} label="License Category" required>
                <MenuItem value="A">Class A CDL</MenuItem>
                <MenuItem value="B">Class B CDL</MenuItem>
                <MenuItem value="C">Class C CDL</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="License Expiry Date"
              type="date"
              value={licenseExpiryDate}
              onChange={(e) => setLicenseExpiryDate(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Safety Score (0-100)"
              type="number"
              value={safetyScore}
              onChange={(e) => setSafetyScore(e.target.value)}
              required
              margin="dense"
            />
          </Grid>
          {editMode && (
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
                  <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
                  <MenuItem value="ON_TRIP">ON_TRIP</MenuItem>
                  <MenuItem value="OFF_DUTY">OFF_DUTY</MenuItem>
                  <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Button onClick={onCancel} disabled={loading} sx={{ color: 'text.secondary' }}>Cancel</Button>
        <Button type="submit" disabled={loading} variant="contained" sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}>
          Save Driver
        </Button>
      </DialogActions>
    </form>
  );
};

export default DriverForm;
