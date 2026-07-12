import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Chip,
  useTheme,
  TablePagination,
} from '@mui/material';
import { Edit, Users } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import { TableLoadingSkeleton } from '../LoadingSkeleton';

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber: string;
  safetyScore: number;
  status: string;
  userId: string | null;
}

interface DriverTableProps {
  drivers: Driver[];
  total: number;
  page: number;
  rowsPerPage: number;
  isSafetyOfficer: boolean;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
  onEdit: (driver: Driver) => void;
  isLoading?: boolean;
}

const getExpiryHighlight = (dateStr: string) => {
  const expiry = new Date(dateStr);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: 'EXPIRED', color: 'error', fontColor: '#ef4444' };
  }
  if (diffDays <= 30) {
    return { label: `EXPIRING SOON (${diffDays}d)`, color: 'warning', fontColor: '#f59e0b' };
  }
  return null;
};

const DriverTable: React.FC<DriverTableProps> = ({
  drivers,
  total,
  page,
  rowsPerPage,
  isSafetyOfficer,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  isLoading = false,
}) => {
  const theme = useTheme();

  return (
    <TableContainer component={Paper} className="glass-panel" sx={{ bgcolor: 'transparent' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { color: 'text.secondary', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` } }}>
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
          {drivers.map((d) => {
            const expiryAlert = getExpiryHighlight(d.licenseExpiryDate);
            return (
              <TableRow key={d.id} sx={{ '& td': { borderBottom: `1px solid ${theme.palette.divider}`, color: 'text.primary' } }}>
                <TableCell style={{ fontWeight: 600 }}>{d.name}</TableCell>
                <TableCell>{d.licenseNumber}</TableCell>
                <TableCell>{d.licenseCategory}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <span style={{ color: expiryAlert ? expiryAlert.fontColor : 'inherit', fontWeight: expiryAlert ? 600 : 400 }}>
                      {new Date(d.licenseExpiryDate).toLocaleDateString('en-IN')}
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
                      <IconButton size="small" onClick={() => onEdit(d)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                        <Edit size={16} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {isLoading && <TableLoadingSkeleton rows={rowsPerPage} columns={isSafetyOfficer ? 8 : 7} />}
          {!isLoading && drivers.length === 0 && (
            <TableRow>
              <TableCell colSpan={isSafetyOfficer ? 8 : 7} align="center" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Users size={48} color={theme.palette.text.disabled} />
                  <Typography variant="h6" color="text.secondary">No drivers found</Typography>
                  <Typography variant="body2" color="text.secondary">Try adjusting your search or filters.</Typography>
                </Box>
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
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        sx={{ color: 'text.secondary', borderTop: `1px solid ${theme.palette.divider}` }}
      />
    </TableContainer>
  );
};

export default DriverTable;
