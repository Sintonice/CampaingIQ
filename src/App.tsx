import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Table, 
  Lightbulb, 
  History, 
  Mail, 
  FileDown, 
  Settings, 
  RefreshCw,
  SlidersHorizontal,
  CircleAlert,
  Sliders,
  Loader2
} from 'lucide-react';
import { Campaign, DailyPerformance } from './types';

// Importing custom sub-components
import Sidebar from './components/Sidebar';
import KPISection from './components/KPISection';
import LineSpendRevenueChart from './components/LineSpendRevenueChart';
import BarCampaignPerformanceChart from './components/BarCampaignPerformanceChart';
import D3BubbleChart from './components/D3BubbleChart';
import CampaignsTable from './components/CampaignsTable';
import InsightsView from './components/InsightsView';
import HistoricalTrendsView from './components/HistoricalTrendsView';
import EmailScheduleView from './components/EmailScheduleView';
import ReportsView from './components/ReportsView';
import CompetitorBenchmarkingView from './components/CompetitorBenchmarkingView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [historicalData, setHistoricalData] = useState<DailyPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [geminiConnected, setGeminiConnected] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [staticMode, setStaticMode] = useState(false);

  // Fetch campaign list & dynamic timelines from Express backend
  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns');
      if (!res.ok) throw new Error('Could not request granular campaigns datasets');
      const data = await res.json();
      setCampaigns(data);
    } catch (err: any) {
      console.error(err);
      setGlobalError(err.message || 'Unknown network connection issue');
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const res = await fetch('/api/historical-trends');
      if (!res.ok) throw new Error('Historical service unreached');
      const data = await res.json();
      setHistoricalData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkGeminiStatus = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setGeminiConnected(!!data.geminiConfigured);
      }
    } catch (err) {
      console.error("Health check failure:", err);
    }
  };

  const useStaticFallback = async () => {
    setStaticMode(true);
    setGeminiConnected(false);
    
    // Load from localStorage or preloads
    const localCams = localStorage.getItem('campaigniq_campaigns');
    if (localCams) {
      try {
        const parsed = JSON.parse(localCams);
        setCampaigns(parsed);
        const { generate30DaysPerformance } = await import('./data/campaigns');
        setHistoricalData(generate30DaysPerformance(parsed));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    
    const { INITIAL_CAMPAIGNS, generate30DaysPerformance } = await import('./data/campaigns');
    setCampaigns(INITIAL_CAMPAIGNS);
    setHistoricalData(generate30DaysPerformance(INITIAL_CAMPAIGNS));
    localStorage.setItem('campaigniq_campaigns', JSON.stringify(INITIAL_CAMPAIGNS));
  };

  const initData = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      const testRes = await fetch('/api/campaigns');
      const contentType = testRes.headers.get('content-type');
      if (testRes.ok && contentType && contentType.includes('application/json')) {
        await Promise.all([
          fetchCampaigns(),
          fetchHistoricalData(),
          checkGeminiStatus()
        ]);
        setStaticMode(false);
      } else {
        await useStaticFallback();
      }
    } catch (err) {
      console.warn("Express server unreachable, switching to premium static offline fallback:", err);
      await useStaticFallback();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  // Sync Pause/Active state with backend
  const handleToggleStatus = async (id: string, currentStatus: 'Active' | 'Paused') => {
    const nextStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    if (staticMode) {
      const updated = campaigns.map(c => c.id === id ? { ...c, status: nextStatus as 'Active' | 'Paused' } : c);
      setCampaigns(updated as Campaign[]);
      const { generate30DaysPerformance } = await import('./data/campaigns');
      setHistoricalData(generate30DaysPerformance(updated as Campaign[]));
      localStorage.setItem('campaigniq_campaigns', JSON.stringify(updated));
    } else {
      try {
        const res = await fetch(`/api/campaigns/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        });
        if (res.ok) {
          // Redraw stats dynamically
          await fetchCampaigns();
          await fetchHistoricalData();
        }
      } catch (err) {
        console.error("Failed to alter status:", err);
      }
    }
  };

  // Sync Inline Budget / Revenue editing
  const handleUpdateCampaign = async (id: string, spend: number, revenue: number) => {
    if (staticMode) {
      const updated = campaigns.map(c => c.id === id ? { ...c, spend: Number(spend), revenue: Number(revenue) } : c);
      setCampaigns(updated);
      const { generate30DaysPerformance } = await import('./data/campaigns');
      setHistoricalData(generate30DaysPerformance(updated));
      localStorage.setItem('campaigniq_campaigns', JSON.stringify(updated));
    } else {
      try {
        const res = await fetch(`/api/campaigns/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spend, revenue }),
        });
        if (res.ok) {
          await fetchCampaigns();
          await fetchHistoricalData();
        }
      } catch (err) {
        console.error("Failed to update campaign parameters:", err);
      }
    }
  };

  // Reset Dataset to defaults
  const handleResetDataset = async () => {
    if (staticMode) {
      const { INITIAL_CAMPAIGNS, generate30DaysPerformance } = await import('./data/campaigns');
      setCampaigns(INITIAL_CAMPAIGNS);
      setHistoricalData(generate30DaysPerformance(INITIAL_CAMPAIGNS));
      localStorage.setItem('campaigniq_campaigns', JSON.stringify(INITIAL_CAMPAIGNS));
    } else {
      try {
        const res = await fetch('/api/campaigns/reset', { method: 'POST' });
        if (res.ok) {
          await fetchCampaigns();
          await fetchHistoricalData();
        }
      } catch (err) {
        console.error("Failed to reset database metrics:", err);
      }
    }
  };

  // Channel Budget Reallocation Trigger on Backend Express
  const handleTriggerReallocation = async (sourceId: string, targetId: string, amount: number) => {
    const sourceCam = campaigns.find(c => c.id === sourceId);
    const targetCam = campaigns.find(c => c.id === targetId);
    if (!sourceCam || !targetCam) return;

    // Deduct spend from source
    const sourceNewSpend = Math.max(0, sourceCam.spend - amount);
    const sourceROAS = sourceCam.spend > 0 ? sourceCam.revenue / sourceCam.spend : 1;
    const sourceNewRevenue = Math.max(0, sourceNewSpend * sourceROAS);

    // Scaling target spend with historical ROAS
    const targetNewSpend = targetCam.spend + amount;
    const targetROAS = targetCam.spend > 0 ? targetCam.revenue / targetCam.spend : 3.5;
    const targetNewRevenue = targetNewSpend * targetROAS;

    await handleUpdateCampaign(sourceId, sourceNewSpend, sourceNewRevenue);
    await handleUpdateCampaign(targetId, targetNewSpend, targetNewRevenue);
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* KPI Overview Grid */}
            <KPISection campaigns={campaigns} />

            {/* Timelines and Comparative Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineSpendRevenueChart data={historicalData} />
              <BarCampaignPerformanceChart campaigns={campaigns} />
            </div>

            {/* D3 gravity dynamic bubble model */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <D3BubbleChart campaigns={campaigns} />
              </div>
              <div className="lg:col-span-7 bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-orange-500" />
                    <span>Agency Executive Summary Operations</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    The active portfolio currently manages <span className="text-white font-bold">{campaigns.filter(c => c.status === 'Active').length} campaigns</span> across Google and Meta. Total spend efficiency tracks at a consolidated <span className="text-emerald-400 font-bold">{(campaigns.reduce((a,c) => a + c.revenue, 0) / Math.max(1, campaigns.reduce((a,c) => a+c.spend,0))).toFixed(2)}x ROAS</span>. Creative ad revisions and real-time bid adjustments are pacing towards our end-of-year +20% ROI growth target.
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs p-2.5 rounded bg-slate-950/60 border border-slate-850">
                      <span className="text-slate-400">Primary Channel:</span>
                      <span className="font-mono text-white font-bold">Meta Ads (3.32x avg ROAS)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs p-2.5 rounded bg-slate-950/60 border border-slate-850">
                      <span className="text-slate-400">Weakest Performer:</span>
                      <span className="font-mono text-rose-400 font-bold">Google Conquesting (0.74x)</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setActiveTab('campaigns')}
                    className="flex-1 py-2 bg-slate-950 hover:bg-slate-800 text-xs font-bold uppercase text-orange-400 hover:text-orange-500 border border-slate-800 hover:border-orange-500/20 rounded-lg cursor-pointer transition-all"
                  >
                    Manage ROAS Budgets
                  </button>
                  <button 
                    onClick={() => setActiveTab('insights')}
                    className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-xs font-bold uppercase text-white rounded-lg shadow shadow-orange-500/10 cursor-pointer transition-all"
                  >
                    Examine AI Insights
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'campaigns':
        return (
          <motion.div 
            key="campaigns"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CampaignsTable 
              campaigns={campaigns} 
              onToggleStatus={handleToggleStatus}
              onUpdateCampaign={handleUpdateCampaign}
              onReset={handleResetDataset}
            />
          </motion.div>
        );

      case 'insights':
        return (
          <motion.div 
            key="insights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <InsightsView 
              campaigns={campaigns} 
              onTriggerReallocation={handleTriggerReallocation}
            />
          </motion.div>
        );

      case 'trends':
        return (
          <motion.div 
            key="trends"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <HistoricalTrendsView data={historicalData} />
          </motion.div>
        );

      case 'scheduler':
        return (
          <motion.div 
            key="scheduler"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <EmailScheduleView campaigns={campaigns} />
          </motion.div>
        );

      case 'export':
        return (
          <motion.div 
            key="export"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ReportsView campaigns={campaigns} />
          </motion.div>
        );

      case 'benchmarks':
        return (
          <motion.div 
            key="benchmarks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CompetitorBenchmarkingView campaigns={campaigns} />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div id="campaign-root-app" className="min-h-screen bg-slate-950 text-white flex">
      {/* Premium Sidebar Component */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        geminiConnected={geminiConnected} 
      />

      {/* Main Content Node */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Navigation Tabs Header */}
        <header id="navigation-tabs-header" className="px-8 py-5 border-b border-slate-905 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white capitalize">
              {activeTab === 'dashboard' && 'Portfolio Overview'}
              {activeTab === 'campaigns' && 'Campaigns Spreadsheet Control'}
              {activeTab === 'insights' && 'AI Brain Focus & Recommendations'}
              {activeTab === 'trends' && 'Historical Dynamics Trend Dashboard'}
              {activeTab === 'benchmarks' && 'Competitor Benchmarking & Industry Insights'}
              {activeTab === 'scheduler' && 'Stakeholder Dispatch Hub'}
              {activeTab === 'export' && 'Reporting Dispatches & Exports'}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              CampaignIQ Operational Panel • Active client budgets
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="global-sync-refresh"
              onClick={initData}
              className="p-2 border border-slate-800 hover:border-orange-500/20 bg-slate-950/25 text-slate-400 hover:text-white rounded-lg hover:bg-orange-500/5 transition-all cursor-pointer"
              title="Sync dataset"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <span className="text-xs font-mono text-slate-400 px-3 py-1.5 border border-slate-800 bg-slate-950/40 rounded-lg">
              USD ($) Standard
            </span>
          </div>
        </header>

        {/* Dynamic view canvas */}
        <main className="flex-1 p-8">
          {globalError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-350 text-xs flex items-center gap-2 font-mono">
              <CircleAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div>
                <p className="font-bold">Sync error detected:</p>
                <p>{globalError}</p>
              </div>
            </div>
          )}

          {loading && campaigns.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-3" />
              <p className="text-sm text-slate-400 font-mono">Loading CampaignIQ Performance Portal...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {renderActiveTabContent()}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
