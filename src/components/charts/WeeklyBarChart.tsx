import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Cell, Tooltip } from 'recharts';
import { formatNaira } from '@/src/lib/utils';

interface WeeklyBarChartProps {
  data: number[]; // Array of 7 numbers for Mon-Sun
}

export function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartData = data.map((value, index) => ({
    name: days[index],
    value,
    isToday: new Date().getDay() === (index + 1) % 7 // Simple today check
  }));

  return (
    <div className="h-[160px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--color-text-muted)' }}
            dy={10}
          />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-bg-charcoal text-white px-2 py-1 rounded text-[10px] font-bold">
                    {formatNaira(Number(payload[0].value))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isToday ? 'var(--color-accent)' : 'var(--color-accent-border)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
