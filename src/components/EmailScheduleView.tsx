import React, { useState, useEffect } from 'react';
import { Campaign, EmailSchedule } from '../types';
import { 
  Mail, 
  Calendar, 
  User, 
  Check, 
  Trash2, 
  Clock, 
  Plus, 
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle,
  Users
} from 'lucide-react';

interface EmailScheduleViewProps {
  campaigns: Campaign[];
}

export default function EmailScheduleView({ campaigns }: EmailScheduleViewProps) {
  const [schedules, setSchedules] = useState<EmailSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form Fields State
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>(campaigns.slice(0, 3).map(c => c.id));
  const [includePdf, setIncludePdf] = useState(true);
  const [notes, setNotes] = useState('');

  const DEFAULT_SCHEDULES: EmailSchedule[] = [
    {
      id: "s1",
      managerName: "Sarah Jenkins",
      managerEmail: "sarah.j@agencyiq.com",
      frequency: "weekly",
      campaignIds: ["c1", "c3", "c10"],
      includePdf: true,
      notes: "Please review weekly Google Ads high performance assets.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "s2",
      managerName: "David Cole",
      managerEmail: "david.c@agencyiq.com",
      frequency: "monthly",
      campaignIds: ["c6", "c7"],
      includePdf: true,
      notes: "Reporting on core Meta Video and Stories performance.",
      createdAt: new Date().toISOString(),
    }
  ];

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schedules');
      if (!res.ok) throw new Error('Unreached database schedules registry');
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.warn("API server for schedules unreachable, switching to premium local storage fallback:", err);
      const localSchedules = localStorage.getItem('campaigniq_schedules');
      if (localSchedules) {
        try {
          setSchedules(JSON.parse(localSchedules));
          setLoading(false);
          return;
        } catch (e) {
          console.error(e);
        }
      }
      setSchedules(DEFAULT_SCHEDULES);
      localStorage.setItem('campaigniq_schedules', JSON.stringify(DEFAULT_SCHEDULES));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleToggleCampaignSelection = (id: string) => {
    if (selectedCampaignIds.includes(id)) {
      setSelectedCampaignIds(selectedCampaignIds.filter(cid => cid !== id));
    } else {
      setSelectedCampaignIds([...selectedCampaignIds, id]);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerName.trim() || !managerEmail.trim()) {
      setStatusMsg({ type: 'error', text: 'Please fill name and email parameters.' });
      return;
    }
    if (selectedCampaignIds.length === 0) {
      setStatusMsg({ type: 'error', text: 'Select at least 1 campaign for reporting.' });
      return;
    }

    setAddingSchedule(true);
    setStatusMsg(null);

    const checkStaticAndAddLocally = () => {
      const newSchedule: EmailSchedule = {
        id: "sch-" + Date.now(),
        managerName,
        managerEmail,
        frequency,
        campaignIds: selectedCampaignIds,
        includePdf,
        notes,
        createdAt: new Date().toISOString()
      };
      const currentSchedules = localStorage.getItem('campaigniq_schedules') 
        ? JSON.parse(localStorage.getItem('campaigniq_schedules')!) 
        : [...schedules];
      const updatedSchedules = [...currentSchedules, newSchedule];
      setSchedules(updatedSchedules);
      localStorage.setItem('campaigniq_schedules', JSON.stringify(updatedSchedules));
      
      setManagerName('');
      setManagerEmail('');
      setFrequency('weekly');
      setNotes('');
      setStatusMsg({ type: 'success', text: `Report successfully scheduled for ${managerName} (${frequency})!` });
    };

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerName,
          managerEmail,
          frequency,
          campaignIds: selectedCampaignIds,
          includePdf,
          notes,
        }),
      });

      if (!res.ok) throw new Error('Database rejection: failed to save scheduled configurations');
      const data = await res.json();
      
      // Reset form on success
      setManagerName('');
      setManagerEmail('');
      setFrequency('weekly');
      setNotes('');
      setStatusMsg({ type: 'success', text: `Report successfully scheduled for ${managerName} (${frequency})!` });
      
      fetchSchedules();
    } catch (err: any) {
      console.warn("Schedules API failed, carrying out action locally...", err);
      checkStaticAndAddLocally();
    } finally {
      setAddingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSchedules(schedules.filter(s => s.id !== id));
      } else {
        throw new Error("Could not delete from backend API");
      }
    } catch (err) {
      console.warn("Delete API failed, removing locally...", err);
      const updated = schedules.filter(s => s.id !== id);
      setSchedules(updated);
      localStorage.setItem('campaigniq_schedules', JSON.stringify(updated));
    }
  };

  return (
    <div id="email-schedules-section" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scheduler Config Entry Form */}
        <div className="lg:col-span-5 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-orange-500" />
            <span>Create Performance Report Schedule</span>
          </h3>

          <form onSubmit={handleCreateSchedule} className="space-y-4">
            {/* Manager Name */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <User size={12} /> Key Account Manager Name
              </label>
              <input
                id="schedule-manager-name"
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            {/* Manager Email */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <Mail size={12} /> Key Stakeholder/Manager Email
              </label>
              <input
                id="schedule-manager-email"
                type="email"
                placeholder="e.g. s.jenkins@corporate.com"
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            {/* Frequency Selector */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <Calendar size={12} /> Dispatched Frequency
              </label>
              <select
                id="schedule-frequency"
                value={frequency}
                onChange={(e: any) => setFrequency(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
              >
                <option value="daily">Daily Briefing (Every morning at 8:00 AM)</option>
                <option value="weekly">Weekly Compilation (Every Monday morning)</option>
                <option value="monthly">Monthly Audit (First day of each month)</option>
              </select>
            </div>

            {/* Campaign Inclusions */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                Selected Campaigns Report Targets ({selectedCampaignIds.length})
              </label>
              <div className="max-h-[140px] overflow-y-auto border border-slate-800/80 bg-slate-950/60 rounded-lg p-2.5 space-y-1.5 scrollbar-thin">
                {campaigns.map((c) => {
                  const isChecked = selectedCampaignIds.includes(c.id);
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => handleToggleCampaignSelection(c.id)}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-slate-300 text-xs ${
                        isChecked ? 'bg-orange-500/10 border border-orange-500/20 text-white' : 'hover:bg-slate-900/60 border border-transparent'
                      }`}
                    >
                      <span className="truncate pr-4">{c.name}</span>
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                        isChecked ? 'bg-orange-500 border-orange-600 text-white' : 'border-slate-700 bg-transparent'
                      }`}>
                        {isChecked && <Check size={10} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Include attachment */}
            <div className="flex items-center gap-2.5 select-none">
              <input
                id="schedule-pdf-checkbox"
                type="checkbox"
                checked={includePdf}
                onChange={(e) => setIncludePdf(e.target.checked)}
                className="rounded text-orange-500 border-slate-700 bg-slate-950 cursor-pointer"
              />
              <label htmlFor="schedule-pdf-checkbox" className="text-xs text-slate-350 cursor-pointer text-slate-200">
                Attach weekly summary performance PDF reports
              </label>
            </div>

            {/* Directives / Notes */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                Custom Dispatch Context/Directives
              </label>
              <textarea
                id="schedule-notes"
                placeholder="Include key campaign parameters notes for the stakeholder..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              id="schedule-submit-btn"
              type="submit"
              disabled={addingSchedule}
              className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-xs font-bold uppercase tracking-wider text-white rounded-lg cursor-pointer flex items-center justify-center gap-2"
            >
              {addingSchedule ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Configuring Scheduler...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Register report schedule</span>
                </>
              )}
            </button>
          </form>

          {statusMsg && (
            <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-xs font-mono select-none ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/60' 
                : 'bg-rose-950/30 text-rose-450 border border-rose-900/60'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>

        {/* Saved Schedules Listing */}
        <div className="lg:col-span-7 bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex flex-col">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            <span>Active Automated Email Schedules</span>
          </h3>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-xs text-slate-400 font-mono mt-2">Pulling schedules database...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-800 rounded-lg bg-slate-950/10">
              <Clock className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs text-slate-450">No report configurations registered in CampaignIQ database.</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[280px]">Add team key account manager emails to receive periodic analytical summaries automatically.</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto flex-1 max-h-[440px]">
              {schedules.map((schedule) => (
                <div 
                  key={schedule.id} 
                  id={`schedule-row-${schedule.id}`}
                  className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-orange-500/15 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-xs font-bold text-slate-100">{schedule.managerName}</h4>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {schedule.frequency}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">{schedule.managerEmail}</p>
                    <p className="text-[11px] text-slate-350 leading-relaxed font-sans">{schedule.notes || 'No custom directives.'}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono pt-1.5">
                      <span className="flex items-center gap-1">
                        <FileText size={11} className="text-slate-400" />
                        PDF: {schedule.includePdf ? 'YES' : 'NO'}
                      </span>
                      <span>•</span>
                      <span>Target: {schedule.campaignIds.length} campaigns</span>
                    </div>
                  </div>

                  <div>
                    <button
                      id={`delete-schedule-btn-${schedule.id}`}
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="p-1 px-2.5 border border-slate-850 hover:border-rose-900/30 rounded text-slate-400 hover:text-white hover:bg-rose-950/20 transition-all flex items-center gap-1 font-mono text-[10px] font-bold cursor-pointer"
                    >
                      <Trash2 size={12} className="text-slate-500 group-hover:text-rose-450" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
