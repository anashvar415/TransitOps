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
import { Edit, Trash2 } from 'lucide-react';
import StatusBadge from '../StatusBadge';

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
}) => {
  return (
    <TableContainer component={Paper} className="glass-panel" sx={{ bgcolor: 'rgba(22, 24, 35, 0.4)' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { color: '#9ca3af', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)' } }}>
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
            <TableRow key={v.id} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f3f4f6' } }}>
              <TableCell style={{ fontWeight: 600 }}>{v.registrationNumber}</TableCell>
              <TableCell>{v.name}</TableCell>
              <TableCell>{v.type}</TableCell>
              <TableCell>{Number(v.maxLoadCapacityKg).toLocaleString()}</TableCell>
              <TableCell>{Number(v.odometerKm).toLocaleString()}</TableCell>
              <TableCell>{v.region}</TableCell>
              <TableCell><StatusBadge status={v.status} /></TableCell>
              {isManager && (
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(v)} sx={{ color: '#9ca3af', '&:hover': { color: '#8b5cf6' } }}>
                      <Edit size={16} />
                    </IconButton>
                  </Tooltip>
                  {v.status !== 'RETIRED' && (
                    <Tooltip title="Retire">
                      <IconButton size="small" onClick={() => onRetire(v.id)} sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444' } }}>
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
          {vehicles.length === 0 && (
            <TableRow>
              <TableCell colSpan={isManager ? 8 : 7} align="center" sx={{ py: 6, color: '#6b7280' }}>
                No vehicles found
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

export default VehicleTable;
