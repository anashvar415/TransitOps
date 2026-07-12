import React from 'react';
import { Skeleton, Box, TableRow, TableCell } from '@mui/material';

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableLoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5, columns = 6 }) => {
  return (
    <>
      {Array.from(new Array(rows)).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {Array.from(new Array(columns)).map((_, colIndex) => (
            <TableCell key={`skeleton-col-${colIndex}`}>
              <Skeleton animation="wave" height={24} sx={{ borderRadius: '4px' }} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export const CardLoadingSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Skeleton animation="wave" variant="text" width="60%" height={32} sx={{ mb: 1 }} />
      <Skeleton animation="wave" variant="rectangular" width="100%" height={120} sx={{ borderRadius: '8px' }} />
    </Box>
  );
};
