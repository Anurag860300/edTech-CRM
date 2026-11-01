import React from 'react';
import { 
  Eye, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  Inbox, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

const USER_TYPE_BADGES = {
  'Parent': 'bg-sky-50 text-sky-700 border-sky-200',
  'Student': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'School': 'bg-purple-50 text-purple-700 border-purple-200'
};

const CATEGORY_BADGES = {
  'Scholarship': 'bg-amber-50 text-amber-700 border-amber-200',
  'Concert': 'bg-pink-50 text-pink-700 border-pink-200',
  'Admission': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'General Query': 'bg-slate-100 text-slate-700 border-slate-300'
};

const STATUS_BADGES = {
  'Pending': 'bg-amber-100 text-amber-800 border-amber-300',
  'In Review': 'bg-blue-100 text-blue-800 border-blue-300',
  'Contacted': 'bg-purple-100 text-purple-800 border-purple-300',
  'Resolved': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Archived': 'bg-slate-200 text-slate-700 border-slate-400'
};

const InquiryTable = ({
  inquiries,
  loading,
  onSelectInquiry,
  onQuickStatusChange,
  onDeleteInquiry
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mb-3 animate-spin">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-700">Loading inquiries from database...</p>
        <p className="text-xs text-slate-400 mt-1">Connecting to Supabase PostgreSQL</p>
      </div>
    );
  }

  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-4 border border-slate-200">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No inquiries match your criteria</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Try clearing your filters or search keywords, or submit a test inquiry using the Public Inquiry Form.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Name</th>
              <th className="py-3.5 px-4">Phone</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">User Type</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {inquiries.map((inq) => {
              const formattedDate = new Date(inq.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <tr 
                  key={inq.id}
                  className="hover:bg-slate-50/60 transition group cursor-pointer"
                  onClick={() => onSelectInquiry(inq)}
                >
                  {/* Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {inq.name ? inq.name.charAt(0).toUpperCase() : '?'}
                      </span>
                      <div>
                        <div>{inq.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">#{inq.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{inq.phone}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 max-w-[180px] truncate" title={inq.email}>
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{inq.email}</span>
                    </div>
                  </td>

                  {/* User Type */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${USER_TYPE_BADGES[inq.user_type] || 'bg-slate-100 text-slate-700'}`}>
                      {inq.user_type}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${CATEGORY_BADGES[inq.category] || 'bg-slate-100 text-slate-700'}`}>
                      {inq.category}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={inq.status}
                      onChange={(e) => onQuickStatusChange(inq.id, e.target.value)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-md border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400 ${STATUS_BADGES[inq.status] || 'bg-slate-100 text-slate-700 border-slate-300'}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Review">In Review</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectInquiry(inq)}
                        title="View Full Inquiry"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete inquiry #${inq.id} from ${inq.name}?`)) {
                            onDeleteInquiry(inq.id);
                          }
                        }}
                        title="Delete Inquiry"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
        <span>Showing <strong className="text-slate-800">{inquiries.length}</strong> inquiries</span>
        <span className="text-[11px] text-slate-400">Click any row to open the complete message & notes modal</span>
      </div>
    </div>
  );
};

export default InquiryTable;
