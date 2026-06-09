export interface Campaign {
  id: string;
  name: string;
  platform: 'Google Ads' | 'Meta Ads';
  status: 'Active' | 'Paused';
  spend: number;
  revenue: number;
  clicks: number;
  impressions: number;
  conversions: number;
}

export interface DailyPerformance {
  date: string;
  spend: number;
  revenue: number;
  conversions: number;
  clicks: number;
}

export interface Recommendation {
  id: string;
  type: 'increase' | 'decrease' | 'pause' | 'restructure';
  campaignName: string;
  platform: 'Google Ads' | 'Meta Ads';
  reason: string;
  impactEstimate: string;
}

export interface BudgetReallocation {
  sourceCampaignId: string;
  sourceCampaignName: string;
  targetCampaignId: string;
  targetCampaignName: string;
  amount: number;
  reason: string;
}

export interface EmailSchedule {
  id: string;
  managerName: string;
  managerEmail: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  campaignIds: string[];
  includePdf: boolean;
  notes?: string;
  createdAt: string;
}
