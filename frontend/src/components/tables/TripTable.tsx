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

export interface Trip {
  id: string;
  source: string;
  destination: string;
  status: string;
  departureTime: string;
  arrivalTime: string | null;
  driver?: {
    name: string;
  };
  vehicle?: {
    registrationNumber: string;
  };
}

interface TripTableProps {
  trips: Trip[];
  total: number;
  page: number;
  rowsPerPage: number;
  canEdit: boolean;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
  onEdit: (trip: Trip) => void;
}

const TripTable: React.FC<TripTableProps> = ({
  trips,
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
            <TableCell>Origin</TableCell>
            <TableCell>Destination</TableCell>
            <TableCell>Departure Time</TableCell>
            <TableCell>Assigned Driver</TableCell>
            <TableCell>Vehicle Reg.</TableCell>
            <TableCell>Status</TableCell>
            {canEdit && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {trips.map((t) => (
            <TableRow key={t.id} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f3f4f6' } }}>
              <TableCell style={{ fontWeight: 600 }}>{t.source}</TableCell>
              <TableCell style={{ fontWeight: 600 }}>{t.destination}</TableCell>
              <TableCell>{new Date(t.departureTime).toLocaleString()}</TableCell>
              <TableCell>{t.driver?.name || 'Unassigned'}</TableCell>
              <TableCell>{t.vehicle?.registrationNumber || 'Unassigned'}</TableCell>
              <TableCell><StatusBadge status={t.status} /></TableCell>
              {canEdit && (
                <TableCell align="right">
                  <Tooltip title="Edit Trip">
                    <IconButton size="small" onClick={() => onEdit(t)} sx={{ color: '#9ca3af', '&:hover': { color: '#8b5cf6' } }}>
                      <Edit size={16} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
          {trips.length === 0 && (
            <TableRow>
              <TableCell colSpan={canEdit ? 7 : 6} align="center" sx={{ py: 6, color: '#6b7280' }}>
                No trips found
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

export default TripTable;
