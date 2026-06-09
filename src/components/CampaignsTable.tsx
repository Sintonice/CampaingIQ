import React, { useState } from 'react';
import { Campaign } from '../types';
import { 
  Search, 
  SlidersHorizontal, 
  DollarSign, 
  Eye, 
  EyeOff, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Plus,
  Play,
  Pause
} from 'lucide-react';

interface CampaignsTableProps {
  campaigns: Campaign[];
  onToggleStatus: (id: string, currentStatus: 'Active' | 'Paused') => Promise<void>;
  onUpdateCampaign: (id: string, spend: number, revenue: number) => Promise<void>;
  onReset: () => Promise<void>;
}

export default function CampaignsTable({ 
  campaigns, 
  onToggleStatus, 
  onUpdateCampaign,
  onReset 
}: CampaignsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'Google Ads' | 'Meta Ads'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Paused'>('all');
  
  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSpend, setEditSpend] = useState<string>('');
  const [editRevenue, setEditRevenue] = useState<string>('');
  const [updatingRowId, setUpdatingRowId] = useState<string | null>(null);

  // Filters logic
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || c.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const getROASBadgeClass = (roas: number) => {
    if (roas >= 3.0) return 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/85';
    if (roas >= 2.0) return 'bg-amber-950/40 text-amber-400 border border-amber-800/85';
    return 'bg-rose-950/40 text-rose-450 border border-rose-800/85';
  };

  const handleStartEdit = (c: Campaign) => {
    setEditingId(c.id);
    setEditSpend(c.spend.toString());
    setEditRevenue(c.revenue.toString());
  };

  const handleSaveEdit = async (id: string) => {
    setUpdatingRowId(id);
    const spendNum = parseFloat(editSpend);
    const revNum = parseFloat(editRevenue);
    
    if (!isNaN(spendNum) && !isNaN(revNum)) {
      await onUpdateCampaign(id, spendNum, revNum);
    }
    setEditingId(null);
    setUpdatingRowId(null);
  };

  return (
    <div id="campaigns-manager-section" className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            id="table-search"
            type="text"
            placeholder="Search campaigns by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Platform Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-slate-500 uppercase">Platform:</span>
            <select
              id="platform-filter"
              value={platformFilter}
              onChange={(e: any) => setPlatformFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Channels</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Meta Ads">Meta Ads</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-slate-500 uppercase">Status:</span>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            id="table-reset-data"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-800 hover:border-orange-500/30 bg-slate-950/20 hover:bg-orange-500/5 text-xs font-semibold rounded-lg text-slate-350 hover:text-white transition-all cursor-pointer"
            title="Reset dataset back to defaults"
          >
            <RefreshCw size={12} />
            <span>Reset Dataset</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table id="campaigns-data-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800/80 text-[11px] font-mono tracking-wider text-slate-450 uppercase">
                <th className="py-3.5 px-4 font-semibold">Campaign Details</th>
                <th className="py-3.5 px-4 font-semibold">Channel</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Spend (USD)</th>
                <th className="py-3.5 px-4 font-semibold text-right">Revenue (USD)</th>
                <th className="py-3.5 px-4 font-semibold text-center">ROAS</th>
                <th className="py-3.5 px-4 font-semibold text-center">CTR</th>
                <th className="py-3.5 px-4 font-semibold text-right">Avg CPC</th>
                <th className="py-3.5 px-4 font-semibold text-right">Convs</th>
                <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-500">
                    No campaigns match your specific filters.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => {
                  const roas = c.spend > 0 ? c.revenue / c.spend : 0;
                  const ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
                  const cpc = c.clicks > 0 ? c.spend / c.clicks : 0;
                  const isEditing = editingId === c.id;

                  return (
                    <tr 
                      key={c.id} 
                      id={`table-row-${c.id}`}
                      className="hover:bg-slate-900/30 transition-colors group"
                    >
                      {/* Name */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-100 max-w-[240px] truncate" title={c.name}>
                          {c.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {c.id}</div>
                      </td>

                      {/* Channel */}
                      <td className="py-4 px-4">
                        <span className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded font-mono ${
                          c.platform === 'Google Ads' 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}>
                          {c.platform === 'Google Ads' ? 'GAds' : 'Meta'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <button
                          id={`toggle-status-btn-${c.id}`}
                          onClick={() => onToggleStatus(c.id, c.status)}
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-bold border transition-colors cursor-pointer ${
                            c.status === 'Active'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                          title={`Click to turn ${c.status === 'Active' ? 'OFF' : 'ON'}`}
                        >
                          {c.status === 'Active' ? (
                            <>
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                              <span>ACTIVE</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                              <span>PAUSED</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Spend */}
                      <td className="py-4 px-4 text-right font-mono text-slate-200">
                        {isEditing ? (
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-slate-500 text-xs">$</span>
                            <input
                              id={`edit-spend-input-${c.id}`}
                              type="number"
                              value={editSpend}
                              onChange={(e) => setEditSpend(e.target.value)}
                              className="w-20 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-right text-white focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        ) : (
                          `$${c.spend.toLocaleString('en-US')}`
                        )}
                      </td>

                      {/* Revenue */}
                      <td className="py-4 px-4 text-right font-mono text-slate-200">
                        {isEditing ? (
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-slate-500 text-xs">$</span>
                            <input
                              id={`edit-revenue-input-${c.id}`}
                              type="number"
                              value={editRevenue}
                              onChange={(e) => setEditRevenue(e.target.value)}
                              className="w-20 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-right text-white focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        ) : (
                          `$${c.revenue.toLocaleString('en-US')}`
                        )}
                      </td>

                      {/* ROAS Badge */}
                      <td className="py-4 px-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded font-bold font-mono tracking-wide ${getROASBadgeClass(roas)}`}>
                          {roas.toFixed(2)}x
                        </span>
                      </td>

                      {/* CTR */}
                      <td className="py-4 px-4 text-center font-mono text-slate-400">
                        {ctr.toFixed(2)}%
                      </td>

                      {/* CPC */}
                      <td className="py-4 px-4 text-right font-mono text-slate-400">
                        ${cpc.toFixed(2)}
                      </td>

                      {/* Conversions */}
                      <td className="py-4 px-4 text-right font-mono text-slate-200">
                        {c.conversions.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                id={`save-inline-edit-${c.id}`}
                                onClick={() => handleSaveEdit(c.id)}
                                className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-[10px] uppercase font-bold text-white rounded cursor-pointer transition-colors"
                              >
                                {updatingRowId === c.id ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                id={`cancel-inline-edit-${c.id}`}
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 bg-slate-950/80 hover:bg-slate-800 text-[10px] uppercase font-bold text-slate-350 rounded cursor-pointer transition-colors border border-slate-800"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              id={`edit-inline-trigger-${c.id}`}
                              onClick={() => handleStartEdit(c)}
                              className="opacity-60 hover:opacity-100 text-[11px] font-bold text-orange-400 hover:text-orange-500 transition-all font-mono py-1 px-2 border border-slate-800/80 hover:border-orange-500/30 rounded bg-slate-950/25 cursor-pointer"
                            >
                              Edit ROI
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
