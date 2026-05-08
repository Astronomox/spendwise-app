// src/components/charts/WeeklyBarChart.tsx
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  type TooltipProps,
} from 'recharts';
import { type ValueType, type NameType } from 'recharts/types/component/DefaultTooltipContent';
import { formatNaira } from '@/lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

interface ChartEntry {
  name:    string;
  value:   number;
  isToday: boolean;
}

function CustomTooltip({
  active,
  payload,
}: TooltipProps<ValueType, NameType>): React.JSX.Element | null {
  if (!active || !payload?.length) return null;
  const raw = payload[0]?.value;
  const amount = typeof raw === 'number' ? raw : 0;
  return (
    <div className="bg-forge-elevated border border-white/[0.10] rounded-xl px-3 py-2 text-[12px] font-bold text-cream shadow-card-lg">
      {formatNaira(amount)}
    </div>
  );
}

export interface WeeklyBarChartProps {
  /** 7-element array: index 0 = Monday … index 6 = Sunday */
  data: readonly number[];
}

export default function WeeklyBarChart({ data }: WeeklyBarChartProps): React.JSX.Element {
  // Sunday = 0 in JS; convert to Mon-based index
  const todayIdx = (new Date().getDay() + 6) % 7;

  const chartData: ChartEntry[] = data.map((value, i) => ({
    name:    DAYS[i] ?? '',
    value,
    isToday: i === todayIdx,
  }));

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rustBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#D4541A" stopOpacity={1} />
              <stop offset="100%" stopColor="#8B3A1D" stopOpacity={0.85} />
            </linearGradient>
            <linearGradient id="dimBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#2A1A10" stopOpacity={1} />
              <stop offset="100%" stopColor="#1A100A" stopOpacity={1} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize:   11,
              fontWeight: 600,
              fill:       'rgba(245,241,235,0.3)',
              fontFamily: 'Inter, sans-serif',
            }}
            dy={8}
          />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip cursor={false} content={<CustomTooltip />} />

          <Bar dataKey="value" radius={[7, 7, 0, 0]} barSize={28}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isToday ? 'url(#rustBarGrad)' : 'url(#dimBarGrad)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
