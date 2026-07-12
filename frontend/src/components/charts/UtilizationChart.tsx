import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from 'recharts';

interface UtilizationData {
  date: string;
  utilization: number;
}

interface UtilizationChartProps {
  data: UtilizationData[];
}

const UtilizationChart: React.FC<UtilizationChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="utilizationColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
        <ChartTooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)' }} />
        <Area type="monotone" dataKey="utilization" stroke="#8b5cf6" fillOpacity={1} fill="url(#utilizationColor)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default UtilizationChart;
