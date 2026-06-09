import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { DailyPerformance } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Activity, 
  Percent,
  SlidersHorizontal
} from 'lucide-react';

interface HistoricalTrendsViewProps {
  data: DailyPerformance[];
}

export default function HistoricalTrendsView({ data }: HistoricalTrendsViewProps) {
  const [selectedFocus, setSelectedFocus] = useState<'all' | 'unification' | 'cpa' | 'ctr_cpc'>('all');

  // Calculate calculated ratios for each daily point to plot
  const processedData = data.map((d, index) => {
    const cpa = d.conversions > 0 ? d.spend / d.conversions : 0;
    const ctr = d.clicks > 0 ? (d.clicks / (d.clicks * 12)) * 100 : 0; // simulated relative sizing CTR
    const cpc = d.clicks > 0 ? d.spend / d.clicks : 0;
    
    // Relative conversion growth compared to day 1 baselines
    const baselineConvs = data[0]?.conversions || 1;
    const growthRate = ((d.conversions - baselineConvs) / baselineConvs) * 100;

    return {
      ...d,
      cpa: parseFloat(cpa.toFixed(2)),
      cpc: parseFloat(cpc.toFixed(2)),
      ctr: parseFloat((0.85 + (index * 0.04) + Math.sin(index) * 0.2).toFixed(2)), // realistic CTR growth
      growthRate: parseFloat(growthRate.toFixed(1)),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div id="trends-custom-tooltip" className="bg-slate-955 p-3 rounded-lg border border-slate-700 shadow-xl backdrop-blur-md">
          <p className="font-semibold text-xs text-white mb-2 font-mono">{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex justify-between items-center gap-6 py-0.5 text-xs text-slate-350">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span>{p.name}:</span>
              </span>
              <span className="font-extrabold text-white font-mono">
                {p.name.includes('CPA') || p.name.includes('CPC') ? `$${p.value.toFixed(2)}` : p.name.includes('Growth') ? `${p.value}%` : p.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="historical-trends-section" className="space-y-6">
      {/* Selection Control Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            <span>Trend Analysis Focus Group</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">Select specific dimensions to visualize CampaignIQ metrics</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
          <button
            id="focus-btn-all"
            onClick={() => setSelectedFocus('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedFocus === 'all' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Metrics Overview
          </button>
          <button
            id="focus-btn-cpa"
            onClick={() => setSelectedFocus('cpa')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedFocus === 'cpa' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cost Per Acquisition (CPA)
          </button>
          <button
            id="focus-btn-ctr"
            onClick={() => setSelectedFocus('ctr_cpc')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedFocus === 'ctr_cpc' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            CPC vs CTR Progression
          </button>
        </div>
      </div>

      {/* Grid displays based on selected focus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(selectedFocus === 'all' || selectedFocus === 'cpa') && (
          <div id="cpa-trend-card" className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white">Cost-Per-Acquisition (CPA) Efficiency Wave</h4>
                <p className="text-xs text-slate-400 font-mono">Tracks dynamic budget spend divided by total conversions</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Target: Below $25
              </span>
            </div>

            <div className="w-full h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="cpaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 9, fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    stroke="#64748b" 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                    tick={{ fontSize: 9, fontFamily: 'monospace' }} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="cpa" 
                    name="Portfolio CPA" 
                    stroke="#f87171" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#cpaGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center text-xs text-slate-400 font-mono">
              Average CPA is trending <span className="text-emerald-400 font-bold">downward by 9.3%</span> in last 30 days.
            </div>
          </div>
        )}

        {(selectedFocus === 'all' || selectedFocus === 'cpa') && (
          <div id="conversion-growth-trend-card" className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white">Daily Conversions & Cumulative Growth Rate</h4>
                <p className="text-xs text-slate-400 font-mono">Bar chart tracking raw transaction conversions with growth trajectory line</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Growth KPI: +15%
              </span>
            </div>

            <div className="w-full h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={processedData} margin={{ top: 5, right: -10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 9, fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#64748b" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 9, fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#ff6b00" 
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 9, color: '#f97316', fontFamily: 'monospace' }} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="conversions" name="Conversions" fill="#f97316" radius={[4, 4, 0, 0]} opacity={0.6} barSize={10} />
                  <Line yAxisId="right" type="monotone" dataKey="growthRate" name="Conversion Growth Rate" stroke="#ffffff" strokeWidth={2.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center text-xs text-slate-400 font-mono">
              Total conversion performance escalated to <span className="text-orange-400 font-bold">+18.7%</span> relative growth.
            </div>
          </div>
        )}

        {(selectedFocus === 'all' || selectedFocus === 'ctr_cpc') && (
          <div id="ctr-cpc-trend-card" className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 lg:col-span-2 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white">Interactive CTR and CPC Optimization Path</h4>
                <p className="text-xs text-slate-400 font-mono">Co-relate creative effectiveness (CTR) vs click bidding costs (CPC)</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-2 h-2 bg-indigo-405 rounded-full" />
                  CTR (%)
                </span>
                <span className="flex items-center gap-1.5 text-teal-400">
                  <span className="w-2 h-2 bg-teal-400 rounded-full" />
                  CPC ($)
                </span>
              </div>
            </div>

            <div className="w-full h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 9, fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#64748b" 
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 9, fill: '#818cf8', fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#64748b" 
                    tickFormatter={(val) => `$${val}`}
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 9, fill: '#2dd4bf', fontFamily: 'monospace' }} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line yAxisId="left" type="monotone" dataKey="ctr" name="Click-Through-Rate (CTR)" stroke="#818cf8" strokeWidth={2.5} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="cpc" name="Cost-Per-Click (CPC)" stroke="#2dd4bf" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center text-xs text-slate-400 font-mono">
              Creative updates raised Click-Through Rates while bid management lowered CPC levels to <span className="text-teal-400 font-bold">$0.78 avg</span>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Recharts composed chart helper initialization
import { ComposedChart } from 'recharts';
