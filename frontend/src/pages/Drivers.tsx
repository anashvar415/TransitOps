import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  TablePagination,
  Grid,
  Chip,
} from '@mui/material';
import { Plus, Search, Edit } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber: string;
  safetyScore: number;
  status: string;
  userId: string | null;
  user?: {
    name: string;
    email: string;
  } | null;
}

const Drivers: React.FC = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSafetyOfficer = currentUser.role === 'SAFETY_OFFICER';

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Table params
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Users to link lists
  const [users, setUsers] = useState<any[]>([]);

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [safetyScore, setSafetyScore] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [userId, setUserId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/drivers', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter || undefined,
          licenseCategory: categoryFilter || undefined,
        },
      });
      setDrivers(res.data.data);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // For simplicity, we can link users. If there is an endpoint we can hit it, or we just fetch users in real life.
      // Let's mock or fetch from backend if needed. In Prisma we seeded user profiles, so we can fetch potential driver accounts.
      // For now we will allow linking manually if user accounts are available, or keep it as text/select.
    } catch (e) {}
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, rowsPerPage, statusFilter, categoryFilter]);

  const handleOpenCreateDialog = () => {
    setEditMode(false);
    setSelectedDriverId(null);
    setName('');
    setLicenseNumber('');
    setLicenseCategory('');
    setLicenseExpiryDate('');
    setContactNumber('');
    setSafetyScore('100');
    setStatus('AVAILABLE');
    setUserId(null);
    setValidationError('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (driver: Driver) => {
    setEditMode(true);
    setSelectedDriverId(driver.id);
    setName(driver.name);
    setLicenseNumber(driver.licenseNumber);
    setLicenseCategory(driver.licenseCategory);
    
    // Format date string to YYYY-MM-DD for input
    const date = new Date(driver.licenseExpiryDate);
    const dateStr = date.toISOString().split('T')[0];
    setLicenseExpiryDate(dateStr);

    setContactNumber(driver.contactNumber);
    setSafetyScore(driver.safetyScore.toString());
    setStatus(driver.status);
    setUserId(driver.userId);
    setValidationError('');
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const payload = {
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore: Number(safetyScore),
      status,
      userId: userId || null,
    };

    try {
      if (editMode && selectedDriverId) {
        await api.put(`/drivers/${selectedDriverId}`, payload);
      } else {
        await api.post('/drivers', payload);
      }
      setDialogOpen(false);
      fetchDrivers();
    } catch (err: any) {
      setValidationError(err.response?.data?.error || 'Validation error saving driver');
    }
  };

  // Helper to color license expiry dates
  const getExpiryHighlight = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'EXPIRED', color: 'error', fontColor: '#ef4444' };
    } else if (diffDays <= 30) {
      return { label: `EXPIRING SOON (${diffDays}d)`, color: 'warning', fontColor: '#f59e0b' };
    }
    return null;
  };

  const filteredDrivers = drivers.filter((d) => 
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

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} className="glass-panel" sx={{ bgcolor: 'rgba(22, 24, 35, 0.4)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { color: '#9ca3af', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)' } }}>
                <TableCell>Driver Name</TableCell>
                <TableCell>License Number</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>License Expiry</TableCell>
                <TableCell>Contact Number</TableCell>
                <TableCell>Safety Score</TableCell>
                <TableCell>Status</TableCell>
                {isSafetyOfficer && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDrivers.map((d) => {
                const expiryAlert = getExpiryHighlight(d.licenseExpiryDate);
                return (
                  <TableRow key={d.id} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f3f4f6' } }}>
                    <TableCell style={{ fontWeight: 600 }}>{d.name}</TableCell>
                    <TableCell>{d.licenseNumber}</TableCell>
                    <TableCell>{d.licenseCategory}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <span style={{ color: expiryAlert ? expiryAlert.fontColor : 'inherit', fontWeight: expiryAlert ? 600 : 400 }}>
                          {new Date(d.licenseExpiryDate).toLocaleDateString()}
                        </span>
                        {expiryAlert && (
                          <Chip
                            label={expiryAlert.label}
                            size="small"
                            color={expiryAlert.color as any}
                            sx={{ fontSize: '0.65rem', height: 16, width: 'fit-content', fontWeight: 700 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{d.contactNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${d.safetyScore}/100`}
                        size="small"
                        sx={{
                          bgcolor: d.safetyScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : d.safetyScore >= 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: d.safetyScore >= 80 ? '#10b981' : d.safetyScore >= 60 ? '#f59e0b' : '#ef4444',
                          border: d.safetyScore >= 80 ? '1px solid rgba(16, 185, 129, 0.3)' : d.safetyScore >= 60 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                    {isSafetyOfficer && (
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenEditDialog(d)} sx={{ color: '#9ca3af', '&:hover': { color: '#8b5cf6' } }}>
                            <Edit size={16} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {filteredDrivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isSafetyOfficer ? 8 : 7} align="center" sx={{ py: 6, color: '#6b7280' }}>
                    No drivers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{ color: '#9ca3af', borderTop: '1px solid rgba(255,255,255,0.08)' }}
          />
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#f3f4f6', bgcolor: '#161823' }}>
          {editMode ? 'Edit Driver Profile' : 'Register New Driver'}
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent sx={{ bgcolor: '#161823', color: '#f3f4f6' }}>
            {validationError && <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>}

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
          <DialogActions sx={{ p: 3, bgcolor: '#161823' }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ color: '#9ca3af' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}>
              Save Driver
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Drivers;
