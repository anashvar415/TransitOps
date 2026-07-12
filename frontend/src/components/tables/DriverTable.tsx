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
  TablePagination,
  Box,
  Chip,
} from '@mui/material';
import { Edit } from 'lucide-react';
import StatusBadge from '../StatusBadge';

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
}

export const getExpiryHighlight = (dateStr: string) => {
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

const DriverTable: React.FC<DriverTableProps> = ({
  drivers,
  total,
  page,
  rowsPerPage,
  isSafetyOfficer,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
}) => {
  return (
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
          {drivers.map((d) => {
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
                      <IconButton size="small" onClick={() => onEdit(d)} sx={{ color: '#9ca3af', '&:hover': { color: '#8b5cf6' } }}>
                        <Edit size={16} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {drivers.length === 0 && (
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
        onPageChange={(e, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        sx={{ color: '#9ca3af', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      />
    </TableContainer>
  );
};

export default DriverTable;
