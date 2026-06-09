import React from 'react';
import { Campaign } from '../types';
import { 
  FileDown, 
  FileText, 
  Download, 
  Printer, 
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Target
} from 'lucide-react';

interface ReportsViewProps {
  campaigns: Campaign[];
}

export default function ReportsView({ campaigns }: ReportsViewProps) {
  
  // Handlers for exporting to CSV
  const handleExportCSV = () => {
    // CSV Header row
    const headers = [
      'Campaign Name',
      'Platform/Channel',
      'Status',
      'Spend (USD)',
      'Gross Revenue (USD)',
      'ROAS (x)',
      'Impressions',
      'Clicks',
      'CTR (%)',
      'CPC (USD)',
      'Conversions',
      'Cost-Per-Acquisition (CPA)'
    ];

    // Data rows
    const rows = campaigns.map(c => {
      const roas = c.spend > 0 ? (c.revenue / c.spend).toFixed(2) : '0';
      const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : '0';
      const cpc = c.clicks > 0 ? (c.spend / c.clicks).toFixed(2) : '0';
      const cpa = c.conversions > 0 ? (c.spend / c.conversions).toFixed(2) : '0';

      return [
        `"${c.name.replace(/"/g, '""')}"`,
        c.platform,
        c.status,
        c.spend,
        c.revenue,
        roas,
        c.impressions,
        c.clicks,
        ctr,
        cpc,
        c.conversions,
        cpa
      ];
    });

    // Join CSV String
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    // Create browser Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CampaignIQ_Executive_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handler for Exporting to PDF (Triggering standard print/save Dialog)
  const handlePrintPDF = () => {
    window.print();
  };

  // Metrics summarizing
  const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const totalConvs = campaigns.reduce((acc, c) => acc + c.conversions, 0);
  const averageROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const portfolioCPA = totalConvs > 0 ? totalSpend / totalConvs : 0;

  return (
    <div id="reports-export-center-section" className="space-y-6">
      {/* Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Block */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 mb-3.5">
              <FileDown className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Download Spreadsheets Report</h3>
            <p className="text-xs text-slate-450 leading-relaxed mb-4">
              Export all granular performance indices, campaign statuses, CPA ratios, conversions, impressions, and ROI results to a standard corporate CSV spreadsheet for key analytics parsing.
            </p>
          </div>
          <button
            id="download-csv-btn"
            onClick={handleExportCSV}
            className="w-full sm:w-auto px-4 py-2 bg-slate-950 hover:bg-orange-500/10 hover:border-orange-500/40 border border-slate-800 text-xs font-semibold rounded-lg text-slate-205 py-2.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Generate & Download CSV file</span>
          </button>
        </div>

        {/* PDF Block */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 mb-3.5">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Executive PDF Audit Dispatches</h3>
            <p className="text-xs text-slate-450 leading-relaxed mb-4">
              Generates a clean, ready-to-print marketing performance report of all client indicators. Perfectly formatted for formal presentation to agency account managers and corporate directors.
            </p>
          </div>
          <button
            id="generate-pdf-btn"
            onClick={handlePrintPDF}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-650 text-xs font-semibold rounded-lg text-white py-2.5 flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/10 transition-all cursor-pointer"
          >
            <Printer size={14} />
            <span>Format & Export to PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Corporate Printable Preview Form */}
      <div 
        id="print-preview-container" 
        className="bg-slate-950/80 p-8 border border-slate-800 rounded-xl relative max-w-4xl mx-auto space-y-6 shadow-2xl printable-pdf-view select-none"
      >
        <div className="absolute top-0 right-0 p-3 bg-orange-500/10 rounded-bl border-l border-b border-orange-550/20 text-[9px] text-orange-400 font-mono">
          PREVIEW GENERATION
        </div>

        {/* Header Block */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">Campaign<span className="text-orange-500">IQ</span></span>
              <p className="text-[9px] text-slate-500 font-mono uppercase">WEEKLY EXECUTIVE STATUS AUDIT</p>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 space-y-0.5">
            <div>Date Dispatched: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div>Agency Partner: AgencyIQ Global</div>
            <div>Reporting Stream: Active Google & Meta Portfolio</div>
          </div>
        </div>

        {/* Aggregate Mini Table */}
        <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-800 text-center">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-mono">Total Spend</p>
            <p className="font-bold text-sm text-slate-200 mt-0.5">${totalSpend.toLocaleString('en-US')}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-mono">Gross Revenue</p>
            <p className="font-bold text-sm text-slate-200 mt-0.5">${totalRevenue.toLocaleString('en-US')}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-mono">Average ROAS</p>
            <p className="font-bold text-sm text-emerald-450 mt-0.5">{averageROAS.toFixed(2)}x</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-mono">Average CPA</p>
            <p className="font-bold text-sm text-white mt-0.5">${portfolioCPA.toFixed(2)}</p>
          </div>
        </div>

        {/* Campaigns details */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Granular Campaign Performances</h4>
          <div className="border border-slate-800/80 rounded overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase">
                  <th className="p-2.5 font-semibold">Campaign ID/Name</th>
                  <th className="p-2.5 font-semibold">Channel</th>
                  <th className="p-2.5 font-semibold text-right">Spend</th>
                  <th className="p-2.5 font-semibold text-right">Revenue</th>
                  <th className="p-2.5 font-semibold text-center">ROAS</th>
                  <th className="p-2.5 font-semibold text-right">Convs</th>
                  <th className="p-2.5 font-semibold text-right">CPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {campaigns.map(c => {
                  const roas = c.spend > 0 ? c.revenue / c.spend : 0;
                  const cpa = c.conversions > 0 ? c.spend / c.conversions : 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-900/10">
                      <td className="p-2.5 font-semibold text-slate-300">{c.name}</td>
                      <td className="p-2.5 text-slate-400">{c.platform.split(' ')[0]}</td>
                      <td className="p-2.5 text-right font-mono text-slate-350">${c.spend.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-mono text-slate-350">${c.revenue.toLocaleString()}</td>
                      <td className={`p-2.5 text-center font-bold font-mono ${
                        roas >= 3 ? 'text-emerald-450' : roas >= 2 ? 'text-amber-400' : 'text-rose-450'
                      }`}>
                        {roas.toFixed(2)}x
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-400">{c.conversions}</td>
                      <td className="p-2.5 text-right font-mono text-slate-400">${cpa.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures block */}
        <div className="flex justify-between items-center pt-8 border-t border-slate-800 text-[10px] text-slate-550 font-mono">
          <div>Report automatically generated by CampaignIQ Performance Suite • Page 1 of 1</div>
          <div className="border-t border-slate-700/60 w-32 pt-2 text-center text-slate-400 uppercase tracking-widest font-bold">
            AUDIT CLOSED
          </div>
        </div>
      </div>
    </div>
  );
}
