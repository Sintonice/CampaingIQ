import React from 'react';
import { Campaign } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  Maximize2, 
  MousePointer, 
  Target, 
  Percent,
  UserPlus,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

interface KPISectionProps {
  campaigns: Campaign[];
}

export default function KPISection({ campaigns }: KPISectionProps) {
  // Compute totals
  const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);

  // Marketing metrics
  const portfolioROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const averageCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const portfolioCPA = totalConversions > 0 ? totalSpend / totalConversions : 0;

  // Let's create some realistic trend comparisons for a real corporate feel
  const cards = [
    {
      id: 'spend',
      label: 'Total Spend',
      value: `$${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'border-orange-500/20 text-orange-500',
      trend: '+12.4% vs last mo',
      trendUp: true,
      subText: 'Weekly pacing normal'
    },
    {
      id: 'revenue',
      label: 'Gross Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: 'border-emerald-500/20 text-emerald-400',
      trend: '+24.1% vs last mo',
      trendUp: true,
      subText: 'Target pace exceeded'
    },
    {
      id: 'roas',
      label: 'Average ROAS',
      value: `${portfolioROAS.toFixed(2)}x`,
      icon: Maximize2,
      color: 'border-amber-500/20 text-amber-400',
      trend: '+10.5% growth rate',
      trendUp: true,
      subText: 'Multiplier scale target: 3.0x'
    },
    {
      id: 'conversions',
      label: 'Conversions',
      value: totalConversions.toLocaleString('en-US'),
      icon: Target,
      color: 'border-blue-500/20 text-blue-400',
      trend: '+18.7% MoM Growth',
      trendUp: true,
      subText: 'Growth target: 2,500'
    },
    {
      id: 'cpa',
      label: 'Cost Per Acquisition (CPA)',
      value: `$${portfolioCPA.toFixed(2)}`,
      icon: UserPlus,
      color: 'border-rose-500/20 text-rose-400',
      trend: '-9.3% cost reduction',
      trendUp: false, // reduction in CPA is positive
      subText: 'Lower is favorable limit'
    },
    {
      id: 'ctr',
      label: 'Average CTR',
      value: `${averageCTR.toFixed(2)}%`,
      icon: Percent,
      color: 'border-indigo-500/20 text-indigo-400',
      trend: '+4.2% creative uplift',
      trendUp: true,
      subText: 'Industry avg: 1.9%'
    },
    {
      id: 'cpc',
      label: 'Average CPC',
      value: `$${averageCPC.toFixed(2)}`,
      icon: MousePointer,
      color: 'border-teal-500/20 text-teal-400',
      trend: '-5.1% bidding drop',
      trendUp: false, // reduction in CPC is positive
      subText: 'Target lid: $1.20'
    },
  ];

  return (
    <div id="kpi-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositiveMetric = card.id === 'cpa' || card.id === 'cpc' ? !card.trendUp : card.trendUp;
        return (
          <div 
            key={card.id}
            id={`kpi-card-${card.id}`}
            className="bg-slate-900/60 backdrop-blur-md rounded-xl p-5 border border-slate-800 hover:border-orange-500/20 transition-all duration-300 relative group overflow-hidden"
          >
            {/* Background Orange glow on hover */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/5 rounded-full blur-2xl group-hover:bg-orange-600/10 transition-all duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-3 text-slate-400 font-medium text-xs tracking-wider uppercase">
              <span>{card.label}</span>
              <div className={`p-2 rounded-lg bg-slate-950/40 border border-slate-800 ${card.color.split(' ')[1]}`}>
                <Icon size={16} />
              </div>
            </div>

            <p className="text-3xl font-extrabold text-white tracking-tight leading-none mb-2 font-mono">
              {card.value}
            </p>

            <div className="flex items-center justify-between mt-3 text-xs">
              <span className={`flex items-center gap-1 font-semibold ${
                isPositiveMetric ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {isPositiveMetric ? (
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                {card.trend}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{card.subText}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
