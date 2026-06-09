import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { DailyPerformance } from '../types';

interface LineSpendRevenueChartProps {
  data: DailyPerformance[];
}

export default function LineSpendRevenueChart({ data }: LineSpendRevenueChartProps) {
  // Simple custom style tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div id="recharts-tooltip" className="bg-slate-955 p-3 rounded-xl border border-slate-700 shadow-2xl backdrop-blur-md">
          <p className="font-semibold text-xs text-white mb-2 font-mono">{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center gap-7 justify-between py-0.5 text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-slate-350 font-medium">{p.name}:</span>
              </span>
              <span className="font-extrabold text-white font-mono">
                ${p.value.toLocaleString('en-US')}
              </span>
            </div>
          ))}
          <div className="border-t border-slate-700/60 mt-2 pt-1 flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Dynamic ROAS:</span>
            <span className="text-orange-400 font-bold">
              {(payload[1].value / Math.max(1, payload[0].value)).toFixed(2)}x
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="spend-revenue-chart-container" className="w-full h-[320px] bg-slate-900/60 border border-slate-800 rounded-xl p-5 relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Spend Trend vs Gross Revenue</h3>
          <p className="text-xs text-slate-400 font-mono">30-day cumulative performance indicators</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-orange-500">
            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
            <span>Ad Spend</span>
          </div>
          <div className="flex items-center gap-1.5 text-white">
            <span className="w-2.5 h-2.5 bg-white rounded-full" />
            <span>Revenue</span>
          </div>
        </div>
      </div>

      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              tickSize={6}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fontFamily: 'monospace' }} 
            />
            <YAxis 
              stroke="#64748b" 
              tickFormatter={(value) => `$${value}`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fontFamily: 'monospace' }} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="spend" 
              name="Ad Spend" 
              stroke="#f97316" 
              strokeWidth={3}
              activeDot={{ r: 6, stroke: '#1e293b', strokeWidth: 2 }}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Gross Revenue" 
              stroke="#ffffff" 
              strokeWidth={3}
              activeDot={{ r: 6, stroke: '#1e293b', strokeWidth: 2 }}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
