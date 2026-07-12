import React from 'react';
import { Chip } from '@mui/material';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getColors = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'ON_TRIP':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'IN_SHOP':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'RETIRED':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'OFF_DUTY':
        return { bg: 'rgba(107, 114, 128, 0.15)', text: '#9ca3af', border: '1px solid rgba(107, 114, 128, 0.3)' };
      case 'SUSPENDED':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'DRAFT':
        return { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.3)' };
      case 'DISPATCHED':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'COMPLETED':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'CANCELLED':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'OPEN':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'CLOSED':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.15)', text: '#9ca3af', border: '1px solid rgba(107, 114, 128, 0.3)' };
    }
  };

  const style = getColors(status);

  return (
    <Chip
      label={status}
      size="small"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: style.border,
        fontWeight: 600,
        fontSize: '0.75rem',
      }}
    />
  );
};

export default StatusBadge;
