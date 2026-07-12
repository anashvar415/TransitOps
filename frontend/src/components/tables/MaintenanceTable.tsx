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
  useTheme,
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
  const theme = useTheme();

  return (
    <TableContainer component={Paper} className="glass-panel" sx={{ bgcolor: 'transparent' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { color: 'text.secondary', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` } }}>
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
            <TableRow key={r.id} sx={{ '& td': { borderBottom: `1px solid ${theme.palette.divider}`, color: 'text.primary' } }}>
              <TableCell style={{ fontWeight: 600 }}>{r.vehicle?.registrationNumber || 'Unknown'}</TableCell>
              <TableCell>{r.description}</TableCell>
              <TableCell>{Number(r.cost).toLocaleString()}</TableCell>
              <TableCell>{new Date(r.dateReported).toLocaleDateString()}</TableCell>
              <TableCell>{r.dateResolved ? new Date(r.dateResolved).toLocaleDateString() : '-'}</TableCell>
              <TableCell><StatusBadge status={r.status} /></TableCell>
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
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={canEdit ? 7 : 6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
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
        sx={{ color: 'text.secondary', borderTop: `1px solid ${theme.palette.divider}` }}
      />
    </TableContainer>
  );
};

export default MaintenanceTable;
