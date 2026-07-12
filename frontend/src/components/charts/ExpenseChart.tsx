import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

interface ExpenseChartProps {
  data: {
    type: string;
    amount: number;
  }[];
}

const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'];

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  const theme = useTheme();

  // Aggregate data by category
  const aggregated = data.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.type);
    const numAmount = Number(curr.amount) || 0;
    
    if (existing) {
      existing.value += numAmount;
    } else {
      acc.push({ name: curr.type, value: numAmount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  if (aggregated.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography sx={{ color: theme.palette.text.secondary }}>No expense data available for chart.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={aggregated}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {aggregated.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
            contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}`, borderRadius: '8px' }}
            itemStyle={{ color: theme.palette.text.primary }}
          />
          <Legend wrapperStyle={{ color: theme.palette.text.secondary }} />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ExpenseChart;
