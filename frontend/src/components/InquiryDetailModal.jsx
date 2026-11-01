import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Mail, 
  Phone, 
  User, 
  Tag, 
  Users, 
  Clock, 
  CheckCircle2, 
  Save, 
  Trash2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { updateInquiryStatus } from '../services/api';

const STATUS_CONFIG = {
  'Pending': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'In Review': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Contacted': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Archived': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' }
};

const InquiryDetailModal = ({ inquiry, onClose, onUpdated, onDelete }) => {
  const [currentStatus, setCurrentStatus] = useState(inquiry.status);
  const [adminNotes, setAdminNotes] = useState(inquiry.admin_notes || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!inquiry) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await updateInquiryStatus(inquiry.id, currentStatus, adminNotes);
      if (res.success) {
        setSaveSuccess(true);
        if (onUpdated) onUpdated(res.inquiry);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update inquiry');
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = new Date(inquiry.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn my-8">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              #{inquiry.id}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Inquiry Details</h3>
              <p className="text-xs text-slate-400 mt-0.5">Submitted {formattedDate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Status and notes updated successfully!</span>
            </div>
          )}

          {/* Quick info badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">User Type</span>
              <span className="text-xs font-bold text-slate-800 mt-1 inline-block bg-white px-2 py-0.5 rounded border border-slate-200">
                {inquiry.user_type}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Category</span>
              <span className="text-xs font-bold text-indigo-700 mt-1 inline-block bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {inquiry.category}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:col-span-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Ticket Status</span>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                className="mt-1 w-full bg-white border border-slate-300 rounded-lg text-xs font-bold px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="Pending">Pending (New)</option>
                <option value="In Review">In Review</option>
                <option value="Contacted">Contacted</option>
                <option value="Resolved">Resolved</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Personal Details Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Applicant Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">Name</div>
                  <div className="font-semibold text-slate-800">{inquiry.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-slate-400">Email</div>
                  <a href={`mailto:${inquiry.email}`} className="font-semibold text-indigo-600 hover:underline truncate block">
                    {inquiry.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">Phone</div>
                  <a href={`tel:${inquiry.phone}`} className="font-semibold text-slate-800 hover:text-indigo-600">
                    {inquiry.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Full Message / Query */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Inquiry Message / Query</span>
            </h4>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {inquiry.message}
            </div>
          </div>

          {/* Admin Internal Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Internal Admin Notes / Counselor Remarks
            </label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Called parent on 29th Oct. Sent brochure and scholarship criteria PDF."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete inquiry #${inquiry.id}?`)) {
                onDelete(inquiry.id);
              }
            }}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-2 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryDetailModal;
