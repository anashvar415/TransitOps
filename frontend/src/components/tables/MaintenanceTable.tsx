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
} from '@mui/material';
import { Edit } from 'lucide-react';
import StatusBadge from '../StatusBadge';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  description: string;
  cost: number;
  dateReported: string;
  dateResolved: string | null;
  status: string;
  vehicle?: {
    registrationNumber: string;
  };
}

interface MaintenanceTableProps {
  records: MaintenanceRecord[];
  total: number;
  page: number;
  rowsPerPage: number;
  canEdit: boolean;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
  onEdit: (record: MaintenanceRecord) => void;
}

const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
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
            <TableCell>Vehicle</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Cost ($)</TableCell>
            <TableCell>Date Reported</TableCell>
            <TableCell>Date Resolved</TableCell>
            <TableCell>Status</TableCell>
            {canEdit && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((r) => (
            <TableRow key={r.id} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f3f4f6' } }}>
              <TableCell style={{ fontWeight: 600 }}>{r.vehicle?.registrationNumber || 'Unknown'}</TableCell>
              <TableCell>{r.description}</TableCell>
              <TableCell>{Number(r.cost).toLocaleString()}</TableCell>
              <TableCell>{new Date(r.dateReported).toLocaleDateString()}</TableCell>
              <TableCell>{r.dateResolved ? new Date(r.dateResolved).toLocaleDateString() : '-'}</TableCell>
              <TableCell><StatusBadge status={r.status} /></TableCell>
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
                No maintenance records found
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

export default MaintenanceTable;
