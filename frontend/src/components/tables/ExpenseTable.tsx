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
} from '@mui/material';
import { Edit } from 'lucide-react';

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
}) => {
  return (
    <TableContainer component={Paper} className="glass-panel" sx={{ bgcolor: 'rgba(22, 24, 35, 0.4)' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { color: '#9ca3af', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)' } }}>
            <TableCell>Category</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Amount ($)</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Linked Vehicle</TableCell>
            <TableCell>Linked Driver</TableCell>
            {canEdit && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((r) => (
            <TableRow key={r.id} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f3f4f6' } }}>
              <TableCell>
                <Chip size="small" label={r.type} sx={{ bgcolor: getCategoryColor(r.type), color: '#fff', fontWeight: 600, fontSize: '0.7rem' }} />
              </TableCell>
              <TableCell>{r.notes}</TableCell>
              <TableCell style={{ fontWeight: 600 }}>{Number(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
              <TableCell>{r.vehicle?.registrationNumber || '-'}</TableCell>
              <TableCell>{r.driver?.name || '-'}</TableCell>
              {canEdit && (
                <TableCell align="right">
                  <Tooltip title="Update Record">
                    <IconButton size="small" onClick={() => onEdit(r)} sx={{ color: '#9ca3af', '&:hover': { color: '#8b5cf6' } }}>
                      <Edit size={16} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={canEdit ? 7 : 6} align="center" sx={{ py: 6, color: '#6b7280' }}>
                No expense records found
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

export default ExpenseTable;
