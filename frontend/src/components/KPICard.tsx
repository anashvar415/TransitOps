import React from 'react';
import { Card, CardContent, Box, Typography, useTheme } from '@mui/material';

interface KPICardProps {
  title: string;
  value: string | number | undefined;
  icon: React.ReactNode;
  desc: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, desc }) => {
  const theme = useTheme();
  
  return (
    <Card className="glass-panel" sx={{ bgcolor: 'transparent', height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            {title}
          </Typography>
          {icon}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Outfit, sans-serif' }}>
          {value !== undefined ? value : '-'}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          {desc}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default KPICard;
