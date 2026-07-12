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
  Typography,
  useTheme,
} from '@mui/material';
import { Edit, Wrench } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import { TableLoadingSkeleton } from '../LoadingSkeleton';

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
  isLoading?: boolean;
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
  isLoading = false,
}) => {
  const theme = useTheme();

  return (
    <TableContainer component={Paper} className="glass-panel" sx={{ bgcolor: 'transparent' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { color: 'text.secondary', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` } }}>
            <TableCell>Vehicle</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Cost (₹)</TableCell>
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
              <TableCell>₹{Number(r.cost).toLocaleString('en-IN')}</TableCell>
              <TableCell>{new Date(r.dateReported).toLocaleDateString('en-IN')}</TableCell>
              <TableCell>{r.dateResolved ? new Date(r.dateResolved).toLocaleDateString('en-IN') : '-'}</TableCell>
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
          {isLoading && <TableLoadingSkeleton rows={rowsPerPage} columns={canEdit ? 7 : 6} />}
          {!isLoading && records.length === 0 && (
            <TableRow>
              <TableCell colSpan={canEdit ? 7 : 6} align="center" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Wrench size={48} color={theme.palette.text.disabled} />
                  <Typography variant="h6" color="text.secondary">No maintenance records found</Typography>
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

export default MaintenanceTable;
