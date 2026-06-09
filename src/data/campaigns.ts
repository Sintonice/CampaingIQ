import { Campaign, DailyPerformance } from '../types';

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    name: 'Google - Search - Brand Protection',
    platform: 'Google Ads',
    status: 'Active',
    spend: 4200,
    revenue: 18900,
    clicks: 3500,
    impressions: 45000,
    conversions: 280,
  },
  {
    id: 'c2',
    name: 'Google - Search - Competitor Conquesting',
    platform: 'Google Ads',
    status: 'Active',
    spend: 6500,
    revenue: 4800,
    clicks: 4800,
    impressions: 92000,
    conversions: 85,
  },
  {
    id: 'c3',
    name: 'Google - Performance Max - Core Products',
    platform: 'Google Ads',
    status: 'Active',
    spend: 12000,
    revenue: 39600,
    clicks: 8100,
    impressions: 140000,
    conversions: 550,
  },
  {
    id: 'c4',
    name: 'Google - Display - Retargeting',
    platform: 'Google Ads',
    status: 'Active',
    spend: 2100,
    revenue: 4500,
    clicks: 3800,
    impressions: 110000,
    conversions: 62,
  },
  {
    id: 'c5',
    name: 'Google - YouTube - Awareness Booster',
    platform: 'Google Ads',
    status: 'Active',
    spend: 5000,
    revenue: 3200,
    clicks: 12000,
    impressions: 480000,
    conversions: 45,
  },
  {
    id: 'c6',
    name: 'Meta - IG Feed - Core Video Performance',
    platform: 'Meta Ads',
    status: 'Active',
    spend: 15000,
    revenue: 48000,
    clicks: 19500,
    impressions: 220000,
    conversions: 710,
  },
  {
    id: 'c7',
    name: 'Meta - IG Stories - Lead Generation',
    platform: 'Meta Ads',
    status: 'Active',
    spend: 8500,
    revenue: 29750,
    clicks: 11000,
    impressions: 165000,
    conversions: 420,
  },
  {
    id: 'c8',
    name: 'Meta - FB Feed - Lookalike Prospecting',
    platform: 'Meta Ads',
    status: 'Active',
    spend: 9500,
    revenue: 19000,
    clicks: 12500,
    impressions: 210000,
    conversions: 245,
  },
  {
    id: 'c9',
    name: 'Meta - FB Messenger - Interactive Agent',
    platform: 'Meta Ads',
    status: 'Paused',
    spend: 3800,
    revenue: 2100,
    clicks: 4300,
    impressions: 78000,
    conversions: 35,
  },
  {
    id: 'c10',
    name: 'Meta - Retargeting - Dynamic Checkout Abandoners',
    platform: 'Meta Ads',
    status: 'Active',
    spend: 3000,
    revenue: 16500,
    clicks: 4100,
    impressions: 42000,
    conversions: 310,
  }
];

// Generate 30 days of daily historical trend data with consistent sums and minor noise
export function generate30DaysPerformance(campaigns: Campaign[] = INITIAL_CAMPAIGNS): DailyPerformance[] {
  const data: DailyPerformance[] = [];
  const activeCount = campaigns.filter(c => c.status === 'Active').length || 1;
  const baseTotalSpend = campaigns.reduce((acc, c) => acc + (c.status === 'Active' ? c.spend : 0), 0);
  const baseTotalRevenue = campaigns.reduce((acc, c) => acc + (c.status === 'Active' ? c.revenue : 0), 0);
  const baseConversions = campaigns.reduce((acc, c) => acc + (c.status === 'Active' ? c.conversions : 0), 0);
  const baseClicks = campaigns.reduce((acc, c) => acc + (c.status === 'Active' ? c.clicks : 0), 0);

  const dailyAvgSpend = baseTotalSpend / 30;
  const dailyAvgRevenue = baseTotalRevenue / 30;
  const dailyAvgConversions = baseConversions / 30;
  const dailyAvgClicks = baseClicks / 30;

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Introduce periodic growth, weekend dips, and random variance
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Slight upward trend over 30 days for marketing effectiveness
    const trendFactor = 1 + (29 - i) * 0.008; // progressive conversion growth metrics
    const varianceModifier = 0.85 + Math.random() * 0.3; // ±15% variance
    const weekendModifier = isWeekend ? 0.75 : 1.1; // lower spend/revenue on weekends

    const spend = Math.round(dailyAvgSpend * trendFactor * varianceModifier * weekendModifier);
    const revenue = Math.round(dailyAvgRevenue * (trendFactor * 1.05) * varianceModifier * weekendModifier);
    const conversions = Math.round(dailyAvgConversions * trendFactor * varianceModifier * weekendModifier * 1.1);
    const clicks = Math.round(dailyAvgClicks * trendFactor * varianceModifier * weekendModifier);

    data.push({
      date: dateString,
      spend,
      revenue,
      conversions,
      clicks,
    });
  }

  return data;
}
