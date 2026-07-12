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
import { Edit, Trash2, Car } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import { TableLoadingSkeleton } from '../LoadingSkeleton';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  status: string;
  region: string;
}

interface VehicleTableProps {
  vehicles: Vehicle[];
  total: number;
  page: number;
  rowsPerPage: number;
  isManager: boolean;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
  onEdit: (vehicle: Vehicle) => void;
  onRetire: (id: string) => void;
  isLoading?: boolean;
}

const VehicleTable: React.FC<VehicleTableProps> = ({
  vehicles,
  total,
  page,
  rowsPerPage,
  isManager,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onRetire,
  isLoading = false,
}) => {
  const theme = useTheme();

  return (
    <TableContainer component={Paper} className="glass-panel" sx={{ bgcolor: 'transparent' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { color: 'text.secondary', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` } }}>
            <TableCell>Reg. Number</TableCell>
            <TableCell>Name/Model</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Capacity (kg)</TableCell>
            <TableCell>Odometer (km)</TableCell>
            <TableCell>Region</TableCell>
            <TableCell>Status</TableCell>
            {isManager && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {vehicles.map((v) => (
            <TableRow key={v.id} sx={{ '& td': { borderBottom: `1px solid ${theme.palette.divider}`, color: 'text.primary' } }}>
              <TableCell style={{ fontWeight: 600 }}>{v.registrationNumber}</TableCell>
              <TableCell>{v.name}</TableCell>
              <TableCell>{v.type}</TableCell>
              <TableCell>{Number(v.maxLoadCapacityKg).toLocaleString('en-IN')}</TableCell>
              <TableCell>{Number(v.odometerKm).toLocaleString('en-IN')}</TableCell>
              <TableCell>{v.region}</TableCell>
              <TableCell><StatusBadge status={v.status} /></TableCell>
              {isManager && (
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(v)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                      <Edit size={16} />
                    </IconButton>
                  </Tooltip>
                  {v.status !== 'RETIRED' && (
                    <Tooltip title="Retire">
                      <IconButton size="small" onClick={() => onRetire(v.id)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
          {isLoading && <TableLoadingSkeleton rows={rowsPerPage} columns={isManager ? 8 : 7} />}
          {!isLoading && vehicles.length === 0 && (
            <TableRow>
              <TableCell colSpan={isManager ? 8 : 7} align="center" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Car size={48} color={theme.palette.text.disabled} />
                  <Typography variant="h6" color="text.secondary">No vehicles found</Typography>
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

export default VehicleTable;
