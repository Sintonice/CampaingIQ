import React from 'react';
import { 
  TrendingUp, 
  Table, 
  Lightbulb, 
  History, 
  Mail, 
  FileDown, 
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp as TrendIcon,
  CircleDot,
  Scale
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  geminiConnected: boolean;
}

export default function Sidebar({ activeTab, setActiveTab, geminiConnected }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Summary Dashboard', icon: TrendingUp },
    { id: 'campaigns', label: 'Campaigns Manager', icon: Table },
    { id: 'insights', label: 'AI Performance Insights', icon: Lightbulb, badge: 'AI' },
    { id: 'trends', label: 'Historical Trends', icon: History },
    { id: 'benchmarks', label: 'Competitor Benchmarking', icon: Scale },
    { id: 'scheduler', label: 'Email Scheduler', icon: Mail },
    { id: 'export', label: 'Reporting & Export', icon: FileDown },
  ];

  return (
    <div 
      id="campaign-sidebar"
      className={`h-screen bg-slate-900 border-r border-slate-800 text-white flex flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } sticky top-0`}
    >
      <div>
        {/* Logo Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight">Campaign<span className="text-orange-500">IQ</span></span>
                <p className="text-[9px] text-slate-400 font-mono">AGENCY PORTAL v2.5</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
          )}
          <button 
            id="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                    : 'text-slate-400 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className={`ml-auto text-[9px] px-1.5 py-0.5 font-bold rounded ${
                    isActive 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {!collapsed && (
          <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 mb-1">
              <CircleDot className={`w-2.5 h-2.5 ${geminiConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400">
                AI Engine State
              </span>
            </div>
            <p className="text-[11px] text-slate-350 leading-relaxed">
              {geminiConnected 
                ? 'Server Gemini SDK Connected' 
                : 'Offline Analysis Active'}
            </p>
          </div>
        )}
        
        {/* Dynamic Source Code ZIP Download Hook */}
        <div className="pt-1">
          {!collapsed ? (
            <a
              href="/api/download-zip"
              download="CampaignIQ-Source.zip"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FileDown size={14} />
              <span>Download Source ZIP</span>
            </a>
          ) : (
            <a
              href="/api/download-zip"
              download="CampaignIQ-Source.zip"
              title="Download Source ZIP"
              className="flex items-center justify-center w-8 h-8 mx-auto bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white rounded-lg shadow transition-all duration-200"
            >
              <FileDown size={14} />
            </a>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-750 flex items-center justify-center font-bold text-xs border border-orange-500">
            JP
          </div>
          {!collapsed && (
            <div className="truncate">
              <p className="text-xs font-semibold">Juan Pablo</p>
              <p className="text-[10px] text-slate-400 truncate">gomezjuanpablo2005@gmail.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
