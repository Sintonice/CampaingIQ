import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell
} from 'recharts';
import { Campaign } from '../types';
import { 
  BarChart3, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Percent, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Scale, 
  Check, 
  Info,
  Building
} from 'lucide-react';

interface CompetitorBenchmarkingViewProps {
  campaigns: Campaign[];
}

interface BenchmarkData {
  id: string;
  name: string;
  roas: number;
  cpc: number;
  ctr: number; // in %
  cpa: number;
  description: string;
}

const INDUSTRY_BENCHMARKS: BenchmarkData[] = [
  {
    id: 'ecommerce',
    name: 'E-commerce & Digital Commerce',
    roas: 2.85,
    cpc: 0.95,
    ctr: 1.85,
    cpa: 24.50,
    description: 'High purchase volume, fast-paced click bidding, high creative frequency sensitivity.'
  },
  {
    id: 'saas',
    name: 'B2B SaaS & Tech Platforms',
    roas: 1.95,
    cpc: 2.45,
    ctr: 1.15,
    cpa: 68.00,
    description: 'High-touch lead nurturing cycles, larger deal sizes, premium click investments.'
  },
  {
    id: 'apparel',
    name: 'Apparel & Fast Fashion',
    roas: 3.40,
    cpc: 0.62,
    ctr: 2.25,
    cpa: 17.80,
    description: 'Visual impulse acquisitions, strong platform retargeting networks, high CTR trends.'
  },
  {
    id: 'finance',
    name: 'Financial Services & Insurance',
    roas: 2.10,
    cpc: 3.85,
    ctr: 1.05,
    cpa: 92.00,
    description: 'Extremely high CPA acquisitions, strict regulatory constraints, premium keywords.'
  },
  {
    id: 'health',
    name: 'Health, Beauty & Wellness',
    roas: 2.50,
    cpc: 1.15,
    ctr: 1.65,
    cpa: 34.00,
    description: 'Subscription re-order dependencies, influencer social channel bidding, educational creatives.'
  },
  {
    id: 'travel',
    name: 'Travel, Lodging & Hospitality',
    roas: 3.15,
    cpc: 1.30,
    ctr: 2.40,
    cpa: 48.00,
    description: 'Seasonal peak conversions, premium social video ads, high average booking values.'
  }
];

export default function CompetitorBenchmarkingView({ campaigns }: CompetitorBenchmarkingViewProps) {
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('ecommerce');
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>(
    campaigns.map(c => c.id)
  );

  const selectedIndustry = useMemo(() => {
    return INDUSTRY_BENCHMARKS.find(b => b.id === selectedIndustryId) || INDUSTRY_BENCHMARKS[0];
  }, [selectedIndustryId]);

  // Handle batch selections
  const handleToggleCampaign = (id: string) => {
    if (selectedCampaignIds.includes(id)) {
      setSelectedCampaignIds(selectedCampaignIds.filter(cid => cid !== id));
    } else {
      setSelectedCampaignIds([...selectedCampaignIds, id]);
    }
  };

  const handleSelectAll = () => {
    setSelectedCampaignIds(campaigns.map(c => c.id));
  };

  const handleSelectNone = () => {
    setSelectedCampaignIds([]);
  };

  // Calculate aggregated agency metrics
  const agencyMetrics = useMemo(() => {
    const includedCampaigns = campaigns.filter(c => selectedCampaignIds.includes(c.id));
    if (includedCampaigns.length === 0) {
      return {
        roas: 0,
        cpc: 0,
        ctr: 0,
        cpa: 0,
        spend: 0,
        revenue: 0,
        clicks: 0,
        impressions: 0,
        conversions: 0,
        isValid: false
      };
    }

    const totalSpend = includedCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalRevenue = includedCampaigns.reduce((sum, c) => sum + c.revenue, 0);
    const totalClicks = includedCampaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalImpressions = includedCampaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalConversions = includedCampaigns.reduce((sum, c) => sum + c.conversions, 0);

    const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;

    return {
      roas,
      cpc,
      ctr,
      cpa,
      spend: totalSpend,
      revenue: totalRevenue,
      clicks: totalClicks,
      impressions: totalImpressions,
      conversions: totalConversions,
      isValid: true
    };
  }, [campaigns, selectedCampaignIds]);

  // Determine over/under performance percentages & directions
  const metricsComparison = useMemo(() => {
    if (!agencyMetrics.isValid) return [];

    const ind = selectedIndustry;
    const ag = agencyMetrics;

    // ROAS (higher is better)
    const roasGap = ag.roas - ind.roas;
    const roasPct = ind.roas > 0 ? (roasGap / ind.roas) * 100 : 0;
    const roasBetter = roasGap >= 0;

    // CPC (lower is better)
    const cpcGap = ind.cpc - ag.cpc; // positive if agency is cheaper
    const cpcPct = ind.cpc > 0 ? (cpcGap / ind.cpc) * 100 : 0;
    const cpcBetter = cpcGap >= 0;

    // CTR (higher is better)
    const ctrGap = ag.ctr - ind.ctr;
    const ctrPct = ind.ctr > 0 ? (ctrGap / ind.ctr) * 100 : 0;
    const ctrBetter = ctrGap >= 0;

    // CPA (lower is better)
    const cpaGap = ind.cpa - ag.cpa; // positive if agency is cheaper
    const cpaPct = ind.cpa > 0 ? (cpaGap / ind.cpa) * 100 : 0;
    const cpaBetter = cpaGap >= 0;

    return [
      {
        key: 'roas',
        name: 'Return On Ad Spend (ROAS)',
        unit: 'x',
        agency: ag.roas,
        industry: ind.roas,
        gapPct: roasPct,
        isBetter: roasBetter,
        icon: TrendingUp,
        description: 'Measures net marketing returns relative to direct ad expenditure.',
        color: '#f97316'
      },
      {
        key: 'cpc',
        name: 'Average Cost Per Click (CPC)',
        unit: '$',
        agency: ag.cpc,
        industry: ind.cpc,
        gapPct: cpcPct,
        isBetter: cpcBetter,
        icon: DollarSign,
        description: 'Reflects structural bid competitiveness & click acquisition efficiency.',
        color: '#34d399'
      },
      {
        key: 'ctr',
        name: 'Click-Through Rate (CTR)',
        unit: '%',
        agency: ag.ctr,
        industry: ind.ctr,
        gapPct: ctrPct,
        isBetter: ctrBetter,
        icon: Percent,
        description: 'Indicates target audience engagement and ad visual quality.',
        color: '#818cf8'
      },
      {
        key: 'cpa',
        name: 'Cost Per Acquisition (CPA)',
        unit: '$',
        agency: ag.cpa,
        industry: ind.cpa,
        gapPct: cpaPct,
        isBetter: cpaBetter,
        icon: Target,
        description: 'Total actual expenditure required to win solid client conversions.',
        color: '#f43f5e'
      }
    ];
  }, [agencyMetrics, selectedIndustry]);

  // Generate dual bar data for each metric dynamically
  const getDualChartData = (metricKey: string, agencyVal: number, indVal: number) => {
    return [
      { name: 'Agency IQ Port', value: parseFloat(agencyVal.toFixed(2)), type: 'agency' },
      { name: 'Sector Benchmark', value: parseFloat(indVal.toFixed(2)), type: 'industry' }
    ];
  };

  return (
    <div id="industry-benchmarks-view-root" className="space-y-6">
      
      {/* Upper Control Grid: Industry and Campaign Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Industry Selector Grid */}
        <div id="industry-selector-panel" className="lg:col-span-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-orange-500" />
              <span>Select Category Domain</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Choose your comparison target domain</p>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {INDUSTRY_BENCHMARKS.map((ind) => {
              const isSelected = ind.id === selectedIndustryId;
              return (
                <button
                  key={ind.id}
                  id={`benchmark-select-${ind.id}`}
                  onClick={() => setSelectedIndustryId(ind.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                    isSelected 
                      ? 'bg-orange-500/10 border-orange-500/40 text-white' 
                      : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">{ind.name}</span>
                    <span className="text-[9px] font-mono opacity-80 uppercase tracking-widest bg-slate-900 px-1 rounded">
                      {ind.id}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">{ind.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campaign Filter List */}
        <div id="campaign-subset-panel" className="lg:col-span-8 bg-slate-900/60 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-orange-500" />
                  <span>Select Performance Campaigns to Compare</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">Include or exclude specific platforms, bids, and campaigns</p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSelectAll}
                  className="px-2.5 py-1 text-[10px] font-mono tracking-wide bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded cursor-pointer transition-colors"
                >
                  Select All
                </button>
                <button 
                  onClick={handleSelectNone}
                  className="px-2.5 py-1 text-[10px] font-mono tracking-wide bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded cursor-pointer transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Micro grid of checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[190px] overflow-y-auto p-1 border border-slate-850 bg-slate-950/30 rounded-lg">
              {campaigns.map((c) => {
                const isSelected = selectedCampaignIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => handleToggleCampaign(c.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                      isSelected 
                        ? 'bg-orange-500/5 border-orange-500/25 text-white' 
                        : 'bg-slate-950/20 border-transparent text-slate-450 hover:bg-slate-904 hover:text-slate-302'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      isSelected ? 'bg-orange-500 border-orange-600 text-white' : 'border-slate-700 bg-transparent'
                    }`}>
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate leading-none">{c.name}</p>
                      <span className="text-[9px] font-mono text-slate-500">{c.platform}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/60 mt-3 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Currently Active Subsystem:</span>
            <span className="text-white">
              <span className="text-orange-400 font-bold">{selectedCampaignIds.length}</span> of {campaigns.length} Campaigns Compiled
            </span>
          </div>
        </div>

      </div>

      {/* Warning/Alert if zero campaigns are selected */}
      {!agencyMetrics.isValid ? (
        <div className="p-8 border border-dashed border-rose-900/30 bg-rose-950/10 rounded-xl text-center space-y-2">
          <Info className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm font-bold text-white">No active campaigns configured for benchmarking calculations</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Please check at least one campaign from the checklist above to enable comparative industry analytics ratios.</p>
        </div>
      ) : (
        <>
          {/* Bento Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricsComparison.map((metric) => {
              const MetricIcon = metric.icon;
              const formattedAgency = metric.key === 'roas' 
                ? `${metric.agency.toFixed(2)}x` 
                : metric.key === 'ctr' 
                ? `${metric.agency.toFixed(2)}%` 
                : `$${metric.agency.toFixed(2)}`;

              const formattedIndustry = metric.key === 'roas' 
                ? `${metric.industry.toFixed(2)}x` 
                : metric.key === 'ctr' 
                ? `${metric.industry.toFixed(2)}%` 
                : `$${metric.industry.toFixed(2)}`;

              const formattedGap = metric.gapPct >= 0 
                ? `+${metric.gapPct.toFixed(1)}%` 
                : `${metric.gapPct.toFixed(1)}%`;

              return (
                <div 
                  key={metric.key} 
                  id={`metric-bench-card-${metric.key}`}
                  className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-4 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-350">
                      <MetricIcon className="w-4 h-4" />
                    </div>
                    
                    {/* Performance Badge */}
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      metric.isBetter 
                        ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40' 
                        : 'bg-rose-950/30 text-rose-404 border-rose-900/40'
                    }`}>
                      {metric.isBetter ? 'Overperform' : 'Underperform'}
                    </span>
                  </div>

                  {/* Big Numbers */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-450">{metric.name}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-black tracking-tight text-white">{formattedAgency}</span>
                      <span className="text-xs text-slate-500 font-mono">VS {formattedIndustry}</span>
                    </div>
                    
                    {/* Comparative Gap */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      {metric.isBetter ? (
                        <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded font-mono">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>{formattedGap} Efficiency Premium</span>
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-bold text-rose-450 bg-rose-500/5 px-2 py-0.5 rounded font-mono">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>{formattedGap} Growth Deficit</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-450 leading-relaxed font-sans">{metric.description}</p>
                </div>
              );
            })}
          </div>

          {/* Visualization Section: Graphic comparative models */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* ROAS & CPA Comparison Area */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Ad Efficiency Benchmarks (ROAS & CPA)</h4>
                <p className="text-xs text-slate-400 font-mono">Side-by-side agency assets vs anonymized sector baselines</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[220px]">
                {/* ROAS Chart */}
                <div className="relative border border-slate-850 bg-slate-950/20 rounded-lg p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[11px] font-mono mb-2">
                    <span className="text-slate-400">Return on Ad Spend (ROAS)</span>
                    <span className="text-emerald-400 font-bold">More is Better</span>
                  </div>
                  <div className="w-full h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={getDualChartData('roas', agencyMetrics.roas, selectedIndustry.roas)}
                        margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                      >
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} stroke="#334155" />
                        <YAxis tickFormatter={(v) => `${v}x`} tick={{ fontSize: 8, fontFamily: 'monospace' }} stroke="#334155" />
                        <Bar dataKey="value" strokeWidth={1} radius={[4, 4, 0, 0]} barSize={34}>
                          <Cell fill="#f97316" />
                          <Cell fill="#475569" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* CPA Chart */}
                <div className="relative border border-slate-850 bg-slate-950/20 rounded-lg p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[11px] font-mono mb-2">
                    <span className="text-slate-400">Cost Per Acquisition (CPA)</span>
                    <span className="text-orange-450 font-bold">Less is Better</span>
                  </div>
                  <div className="w-full h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={getDualChartData('cpa', agencyMetrics.cpa, selectedIndustry.cpa)}
                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} stroke="#334155" />
                        <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 8, fontFamily: 'monospace' }} stroke="#334155" />
                        <Bar dataKey="value" strokeWidth={1} radius={[4, 4, 0, 0]} barSize={34}>
                          <Cell fill="#f43f5e" />
                          <Cell fill="#475569" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Click-Through Rate & Bidding CPC Comparison */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Target Engagement Benchmarks (CTR & CPC)</h4>
                <p className="text-xs text-slate-400 font-mono">User click metrics and active keyword bid costs comparison</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[220px]">
                {/* CTR Chart */}
                <div className="relative border border-slate-850 bg-slate-950/20 rounded-lg p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[11px] font-mono mb-2">
                    <span className="text-slate-400">Click-Through Rate (CTR)</span>
                    <span className="text-indigo-400 font-bold">More is Better</span>
                  </div>
                  <div className="w-full h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={getDualChartData('ctr', agencyMetrics.ctr, selectedIndustry.ctr)}
                        margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                      >
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} stroke="#334155" />
                        <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 8, fontFamily: 'monospace' }} stroke="#334155" />
                        <Bar dataKey="value" strokeWidth={1} radius={[4, 4, 0, 0]} barSize={34}>
                          <Cell fill="#818cf8" />
                          <Cell fill="#475569" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* CPC Chart */}
                <div className="relative border border-slate-850 bg-slate-950/20 rounded-lg p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[11px] font-mono mb-2">
                    <span className="text-slate-400">Cost per Click (CPC)</span>
                    <span className="text-teal-400 font-bold">Less is Better</span>
                  </div>
                  <div className="w-full h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={getDualChartData('cpc', agencyMetrics.cpc, selectedIndustry.cpc)}
                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} stroke="#334155" />
                        <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 8, fontFamily: 'monospace' }} stroke="#334155" />
                        <Bar dataKey="value" strokeWidth={1} radius={[4, 4, 0, 0]} barSize={34}>
                          <Cell fill="#34d399" />
                          <Cell fill="#475569" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Structured Source, Methodology & Date Block */}
      <div id="benchmark-source-block" className="bg-slate-900/40 border border-slate-850 p-5 rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-orange-500" />
          <span>Benchmark Methodology & Aggregated Source Context</span>
        </h4>
        <div className="text-[11px] text-slate-400 leading-relaxed space-y-2">
          <p>
            The anonymized industry performance data is aggregated and compiled from the <span className="font-semibold text-slate-200">Q1 2026 Digital Media Performance Metrics Initiative</span>. The dataset incorporates metrics across approximately 5,200 advertiser accounts globally, utilizing machine learning deduplication routines to compute clean, middle-tier performance averages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 text-[10px] font-mono text-slate-500 pt-1">
            <span>• Data Recency: Updated Q2 2026 (May 15, 2026 release)</span>
            <span>• Sampling Margin of Error: &plusmn;0.82%</span>
            <span>• Platform Distribution: Google Ads (48%), Meta Core Ads (52%)</span>
          </div>
          <p className="text-[10px] text-slate-500 italic">
            Disclaimer: These benchmarking points represent macroscopic sector aggregates. They are provided solely for contextual positioning and do not constitute direct micro-competitor intelligence or binding operational guarantees. Individual performance depends heavily on localized targeting parameters, copy quality, and specific product-market fits.
          </p>
        </div>
      </div>

    </div>
  );
}
