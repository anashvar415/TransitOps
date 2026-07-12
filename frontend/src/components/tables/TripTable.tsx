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
  const theme = useTheme();

  return (
    <TableContainer component={Paper} className="glass-panel" sx={{ bgcolor: 'transparent' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { color: 'text.secondary', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` } }}>
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
            <TableRow key={t.id} sx={{ '& td': { borderBottom: `1px solid ${theme.palette.divider}`, color: 'text.primary' } }}>
              <TableCell style={{ fontWeight: 600 }}>{t.source}</TableCell>
              <TableCell style={{ fontWeight: 600 }}>{t.destination}</TableCell>
              <TableCell>{new Date(t.departureTime).toLocaleString()}</TableCell>
              <TableCell>{t.driver?.name || 'Unassigned'}</TableCell>
              <TableCell>{t.vehicle?.registrationNumber || 'Unassigned'}</TableCell>
              <TableCell><StatusBadge status={t.status} /></TableCell>
              {canEdit && (
                <TableCell align="right">
                  <Tooltip title="Edit Trip">
                    <IconButton size="small" onClick={() => onEdit(t)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                      <Edit size={16} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
          {trips.length === 0 && (
            <TableRow>
              <TableCell colSpan={canEdit ? 7 : 6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
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
        sx={{ color: 'text.secondary', borderTop: `1px solid ${theme.palette.divider}` }}
      />
    </TableContainer>
  );
};

export default TripTable;
