import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Campaign } from '../types';

interface BarCampaignPerformanceChartProps {
  campaigns: Campaign[];
}

export default function BarCampaignPerformanceChart({ campaigns }: BarCampaignPerformanceChartProps) {
  // Format long campaign names for clean Y-Axis representation
  const chartData = campaigns.map((c) => ({
    name: c.name.length > 25 ? c.name.substring(0, 25) + '...' : c.name,
    fullName: c.name,
    spend: c.spend,
    revenue: c.revenue,
    platform: c.platform,
    roas: c.spend > 0 ? (c.revenue / c.spend) : 0,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div id="bar-chart-tooltip" className="bg-slate-955 p-3 rounded-xl border border-slate-700 shadow-2xl backdrop-blur-md">
          <p className="font-semibold text-xs text-white mb-2 leading-relaxed">{data.fullName}</p>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-2 font-mono">
            {data.platform}
          </div>
          <div className="flex justify-between items-center text-xs gap-6 py-0.5">
            <span className="text-slate-400">Budget Spent:</span>
            <span className="text-orange-400 font-extrabold font-mono">${data.spend.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs gap-6 py-0.5">
            <span className="text-slate-400">Gross Revenue:</span>
            <span className="text-white font-extrabold font-mono">${data.revenue.toLocaleString()}</span>
          </div>
          <div className="border-t border-slate-700 mt-2 pt-1 flex justify-between items-center text-xs">
            <span className="text-slate-400">Campaign ROAS:</span>
            <span className={`font-mono font-black ${
              data.roas >= 3 ? 'text-emerald-400' : data.roas >= 2 ? 'text-amber-400' : 'text-rose-450'
            }`}>
              {data.roas.toFixed(2)}x
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="campaign-bar-comparison" className="w-full h-[320px] bg-slate-900/60 border border-slate-800 rounded-xl p-5 relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Campaign Comparison</h3>
          <p className="text-xs text-slate-400 font-mono">Comparing total budget spend vs return revenue</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded border border-orange-500/10 text-orange-400 bg-orange-500/5">Meta & Google</span>
          <span className="text-slate-400">USD</span>
        </div>
      </div>

      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} vertical={true} />
            <XAxis 
              type="number"
              stroke="#64748b" 
              tickFormatter={(val) => `$${val}`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fontFamily: 'monospace' }} 
            />
            <YAxis 
              type="category"
              dataKey="name" 
              stroke="#64748b" 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fill: '#cbd5e1' }} 
              width={110}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="spend" name="Budget Spent" fill="#f97316" radius={[0, 4, 4, 0]} barSize={8} />
            <Bar dataKey="revenue" name="Gross Revenue" fill="#ffffff" radius={[0, 4, 4, 0]} barSize={8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
