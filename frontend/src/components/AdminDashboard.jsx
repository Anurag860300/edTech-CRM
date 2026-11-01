import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchInquiries, 
  fetchInquiryStats, 
  updateInquiryStatus as apiUpdateStatus,
  deleteInquiry as apiDeleteInquiry
} from '../services/api';
import FilterBar from './FilterBar';
import InquiryTable from './InquiryTable';
import InquiryDetailModal from './InquiryDetailModal';
import { 
  Users, 
  GraduationCap, 
  School, 
  FileText, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle,
  Award,
  Music,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const { admin } = useAuth();

  // State
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Filters & Search State
  const [category, setCategory] = useState('All');
  const [userType, setUserType] = useState('All');
  const [status, setStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Inquiry for Modal
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Load inquiries from backend with filters & search
  const loadInquiries = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage(null);

    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (userType !== 'All') params.user_type = userType;
      if (status !== 'All') params.status = status;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [inquiriesRes, statsRes] = await Promise.all([
        fetchInquiries(params),
        fetchInquiryStats().catch(() => null)
      ]);

      if (inquiriesRes.success) {
        setInquiries(inquiriesRes.inquiries || []);
      }
      if (statsRes && statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setErrorMessage(
        err.response?.data?.message || 
        'Failed to connect to backend server or database.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, userType, status, searchQuery]);

  // Debounced fetch when search or filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadInquiries();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadInquiries]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setCategory('All');
    setUserType('All');
    setStatus('All');
    setSearchQuery('');
  };

  // Quick inline status change handler
  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      const res = await apiUpdateStatus(id, newStatus);
      if (res.success) {
        setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert(`Status update failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Delete Inquiry Handler
  const handleDeleteInquiry = async (id) => {
    try {
      const res = await apiDeleteInquiry(id);
      if (res.success) {
        setInquiries(prev => prev.filter(inq => inq.id !== id));
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry(null);
        }
      }
    } catch (err) {
      alert(`Delete failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    if (inquiries.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Phone', 'User Type', 'Category', 'Status', 'Date', 'Message'];
    const rows = inquiries.map(inq => [
      inq.id,
      `"${(inq.name || '').replace(/"/g, '""')}"`,
      `"${(inq.email || '').replace(/"/g, '""')}"`,
      `"${(inq.phone || '').replace(/"/g, '""')}"`,
      `"${inq.user_type}"`,
      `"${inq.category}"`,
      `"${inq.status}"`,
      `"${new Date(inq.created_at).toISOString()}"`,
      `"${(inq.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edtech_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Inquiry Management CRM
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Authenticated
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{admin?.name || 'Admin'}</strong> ({admin?.email}). Viewing live inquiries from Supabase PostgreSQL.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadInquiries(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={inquiries.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Error notification if database disconnected */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Backend Connection Notice</p>
            <p className="mt-0.5 text-xs text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inquiries */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Inquiries</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {stats?.total ?? inquiries.length}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Stored in Supabase DB</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Student Inquiries */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Students</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {stats?.byUserType?.Student ?? inquiries.filter(i => i.user_type === 'Student').length}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Direct learner queries</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Parent Inquiries */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Parents</span>
            <span className="text-2xl font-black text-sky-600 mt-1 block">
              {stats?.byUserType?.Parent ?? inquiries.filter(i => i.user_type === 'Parent').length}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Admissions & Fees</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* School Inquiries */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Schools</span>
            <span className="text-2xl font-black text-purple-600 mt-1 block">
              {stats?.byUserType?.School ?? inquiries.filter(i => i.user_type === 'School').length}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Institutional & Concerts</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <School className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Mandatory Filters & Search Bar */}
      <FilterBar
        category={category}
        setCategory={setCategory}
        userType={userType}
        setUserType={setUserType}
        status={status}
        setStatus={setStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onReset={handleResetFilters}
      />

      {/* Mandatory Tabular View */}
      <InquiryTable
        inquiries={inquiries}
        loading={loading}
        onSelectInquiry={(inq) => setSelectedInquiry(inq)}
        onQuickStatusChange={handleQuickStatusChange}
        onDeleteInquiry={handleDeleteInquiry}
      />

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onUpdated={(updated) => {
            setSelectedInquiry(updated);
            setInquiries(prev => prev.map(i => i.id === updated.id ? updated : i));
          }}
          onDelete={(id) => handleDeleteInquiry(id)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
