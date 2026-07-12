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
  Chip,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { Edit, Receipt } from 'lucide-react';
import { TableLoadingSkeleton } from '../LoadingSkeleton';

export interface ExpenseRecord {
  id: string;
  type: string;
  amount: number;
  date: string;
  notes: string;
  vehicleId?: string;
  driverId?: string;
  vehicle?: {
    registrationNumber: string;
  };
  driver?: {
    name: string;
  };
}

interface ExpenseTableProps {
  records: ExpenseRecord[];
  total: number;
  page: number;
  rowsPerPage: number;
  canEdit: boolean;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
  onEdit: (record: ExpenseRecord) => void;
  isLoading?: boolean;
}

const getCategoryColor = (type: string) => {
  switch (type) {
    case 'FUEL': return '#3b82f6';
    case 'MAINTENANCE': return '#f59e0b';
    case 'SALARY': return '#10b981';
    case 'TOLL': return '#0ea5e9';
    case 'INSURANCE': return '#8b5cf6';
    default: return '#6b7280';
  }
};

const ExpenseTable: React.FC<ExpenseTableProps> = ({
  records,
  total,
  page,
  rowsPerPage,
  canEdit,
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
            <TableCell>Category</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Amount (₹)</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Linked Vehicle</TableCell>
            <TableCell>Linked Driver</TableCell>
            {canEdit && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((r) => (
            <TableRow key={r.id} sx={{ '& td': { borderBottom: `1px solid ${theme.palette.divider}`, color: 'text.primary' } }}>
              <TableCell>
                <Chip size="small" label={r.type} sx={{ bgcolor: getCategoryColor(r.type), color: '#fff', fontWeight: 600, fontSize: '0.7rem' }} />
              </TableCell>
              <TableCell>{r.notes}</TableCell>
              <TableCell style={{ fontWeight: 600 }}>₹{Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell>{new Date(r.date).toLocaleDateString('en-IN')}</TableCell>
              <TableCell>{r.vehicle?.registrationNumber || '-'}</TableCell>
              <TableCell>{r.driver?.name || '-'}</TableCell>
              {canEdit && (
                <TableCell align="right">
                  <Tooltip title="Update Record">
                    <IconButton size="small" onClick={() => onEdit(r)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                      <Edit size={16} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
          {isLoading && <TableLoadingSkeleton rows={rowsPerPage} columns={canEdit ? 7 : 6} />}
          {!isLoading && records.length === 0 && (
            <TableRow>
              <TableCell colSpan={canEdit ? 7 : 6} align="center" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Receipt size={48} color={theme.palette.text.disabled} />
                  <Typography variant="h6" color="text.secondary">No expense records found</Typography>
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

export default ExpenseTable;
