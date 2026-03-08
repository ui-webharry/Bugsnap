import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Bug, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  ExternalLink,
  Monitor,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  Menu,
  X as CloseIcon,
  ArrowLeft
} from 'lucide-react';
import { BugReport } from '../types';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: 'timestamp' | 'status' | 'title', direction: 'asc' | 'desc' }>({
    key: 'timestamp',
    direction: 'desc'
  });

  const fetchReports = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    setIsUpdating(true);
    try {
      await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await fetchReports(true);
      if (selectedReport?.id === id) {
        setSelectedReport({ ...selectedReport, status: status as any });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteReport = async (id: number) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    setIsUpdating(true);
    try {
      await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      await fetchReports(true);
      if (selectedReport?.id === id) setSelectedReport(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const sortedReports = [...filteredReports].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const toggleSort = (key: 'timestamp' | 'status' | 'title') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleSelectReport = (report: BugReport) => {
    setSelectedReport(report);
    setShowDetailOnMobile(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'in-progress': return <Clock className="text-amber-500" size={16} />;
      default: return <Circle className="text-zinc-300" size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row relative overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 border-r border-zinc-200 bg-white p-6 flex flex-col gap-8 z-50 transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between md:justify-start gap-2 text-indigo-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
              <Bug size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900">BugSnap</span>
          </div>
          <button 
            className="md:hidden p-2 text-zinc-400 hover:text-zinc-600"
            onClick={() => setIsSidebarOpen(false)}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <nav className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium text-sm transition-colors">
            <LayoutDashboard size={18} />
            Reports
          </button>
          <div className="pt-4 mt-4 border-t border-zinc-100">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Installation</p>
            <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
              <p className="text-[10px] text-zinc-500 mb-2 leading-relaxed">Add this script to your website's <code>&lt;head&gt;</code>:</p>
              <pre className="text-[9px] bg-zinc-900 text-zinc-300 p-2 rounded overflow-x-auto">
                {`<script src="${process.env.APP_URL}/widget.js"></script>`}
              </pre>
            </div>
          </div>
          {/* Add more nav items if needed */}
        </nav>

        <div className="mt-auto space-y-6">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Usage</p>
            <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 w-1/4 rounded-full" />
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-medium">25 / 100 reports this month</p>
          </div>

          <div className="flex flex-col items-center justify-center py-4 opacity-40 hover:opacity-100 transition-opacity">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative px-4 py-2 bg-white ring-1 ring-zinc-900/5 rounded-lg leading-none flex items-center justify-center space-x-3">
                <span className="text-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em]">built by ui_webharry</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-200 bg-white px-4 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="relative w-full max-w-xs md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {(isRefreshing || isUpdating) && (
              <div className="hidden sm:flex items-center gap-2 text-indigo-600 animate-pulse">
                <Loader2 size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Syncing</span>
              </div>
            )}
            <button 
              onClick={() => fetchReports()}
              disabled={isRefreshing || isUpdating}
              className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors disabled:opacity-50"
              title="Refresh reports"
            >
              <Filter size={18} className={cn((isRefreshing || isUpdating) && "animate-spin")} />
            </button>
            <div className="w-8 h-8 bg-zinc-200 rounded-full hidden sm:block" />
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          {/* List */}
          <div className={cn(
            "absolute inset-0 md:relative md:w-1/3 border-r border-zinc-200 bg-white flex flex-col transition-transform duration-300 z-10",
            showDetailOnMobile ? "-translate-x-full md:translate-x-0" : "translate-x-0"
          )}>
            {/* List Headers */}
            <div className="px-4 py-2 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-4">
              <button 
                onClick={() => toggleSort('title')}
                className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                Title {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                onClick={() => toggleSort('status')}
                className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                onClick={() => toggleSort('timestamp')}
                className="ml-auto text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                Date {sortConfig.key === 'timestamp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="animate-spin text-zinc-300" size={32} />
                </div>
              ) : sortedReports.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bug className="text-zinc-300" size={24} />
                  </div>
                  <p className="text-sm font-medium text-zinc-500">No reports found</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {sortedReports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => handleSelectReport(report)}
                      className={cn(
                        "w-full p-4 text-left hover:bg-zinc-50 transition-colors flex items-start gap-3",
                        selectedReport?.id === report.id && "bg-indigo-50/50 border-r-2 border-indigo-600"
                      )}
                    >
                      <div className="mt-1">{getStatusIcon(report.status)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-zinc-900 text-sm truncate mb-1">{report.title}</h3>
                        <p className="text-xs text-zinc-500 line-clamp-2 mb-2">{report.description}</p>
                        <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                          <Calendar size={10} />
                          {new Date(report.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-zinc-300 mt-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail */}
          <div className={cn(
            "absolute inset-0 md:relative md:flex-1 bg-zinc-50 overflow-y-auto transition-transform duration-300 z-20",
            showDetailOnMobile ? "translate-x-0" : "translate-x-full md:translate-x-0"
          )}>
            {selectedReport ? (
              <div className="p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-center gap-3 md:hidden">
                      <button 
                        onClick={() => setShowDetailOnMobile(false)}
                        className="p-2 -ml-2 text-zinc-500 hover:bg-zinc-200 rounded-lg"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Back to list</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                          selectedReport.status === 'resolved' ? "bg-emerald-100 text-emerald-700" :
                          selectedReport.status === 'in-progress' ? "bg-amber-100 text-amber-700" :
                          "bg-zinc-100 text-zinc-600"
                        )}>
                          {selectedReport.status}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">Report #{selectedReport.id}</span>
                      </div>
                      <h1 className="text-xl md:text-2xl font-bold text-zinc-900">{selectedReport.title}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedReport.status}
                        disabled={isUpdating}
                        onChange={(e) => updateStatus(selectedReport.id, e.target.value)}
                        className="flex-1 sm:flex-none bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        onClick={() => deleteReport(selectedReport.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-zinc-200">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">URL</p>
                      <a href={selectedReport.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:underline truncate">
                        {new URL(selectedReport.url).hostname} <ExternalLink size={10} />
                      </a>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-zinc-200">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Browser</p>
                      <p className="text-xs text-zinc-600 font-medium truncate" title={selectedReport.userAgent}>
                        {selectedReport.userAgent.split(')')[0].split('(')[1] || 'Unknown'}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-zinc-200">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Reported</p>
                      <p className="text-xs text-zinc-600 font-medium">
                        {new Date(selectedReport.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-zinc-200">
                    <h2 className="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wider">Description</h2>
                    <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedReport.description}
                    </p>
                  </div>

                  {selectedReport.screenshot && (
                    <div className="bg-white p-6 rounded-xl border border-zinc-200">
                      <h2 className="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wider">Screenshot</h2>
                      <div className="rounded-lg overflow-hidden border border-zinc-100 shadow-sm">
                        <img src={selectedReport.screenshot} alt="Bug Screenshot" className="w-full h-auto" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-zinc-200 flex items-center justify-center mb-6">
                  <Bug className="text-zinc-200" size={40} />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 mb-2">Select a report</h2>
                <p className="text-zinc-500 text-sm max-w-xs">
                  Choose a bug report from the list to view its details and screenshot.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("animate-spin", className)}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
