import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  HelpCircle, 
  Building2, 
  Sparkles,
  School,
  GraduationCap,
  Users
} from 'lucide-react';
import { submitPublicInquiry } from '../services/api';

const USER_TYPES = [
  { value: 'Parent', label: 'Parent', icon: Users, desc: 'Inquiring for son/daughter' },
  { value: 'Student', label: 'Student', icon: GraduationCap, desc: 'Direct student inquiry' },
  { value: 'School', label: 'School', icon: School, desc: 'School authority / educator' }
];

const CATEGORIES = [
  { value: 'Scholarship', label: 'Scholarship', tag: 'Merit & Need-based aid' },
  { value: 'Concert', label: 'Concert', tag: 'Annual cultural & music events' },
  { value: 'Admission', label: 'Admission', tag: 'Enrollment & entrance guidance' },
  { value: 'General Query', label: 'General Query', tag: 'Syllabus, timings & assistance' }
];

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  user_type: 'Student',
  category: 'Admission',
  message: ''
};

const PublicInquiryForm = ({ onInquirySubmitted }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email format';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (formData.phone.trim().length < 7) {
      errors.phone = 'Please provide a valid contact number';
    }
    if (!formData.message.trim()) {
      errors.message = 'Please provide your inquiry question or message';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message should be at least 10 characters long';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await submitPublicInquiry(formData);
      if (response.success) {
        setSuccessData(response.inquiry);
        setFormData(INITIAL_FORM);
        if (onInquirySubmitted) {
          onInquirySubmitted(response.inquiry);
        }
      } else {
        setErrorMessage(response.message || 'Failed to submit inquiry.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Connection error. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Public EdTech Helpdesk</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How can we help your learning journey?
        </h1>
        <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
          Whether you're exploring scholarships, interschool concerts, admissions, or general curriculum guidance, submit your inquiry below. Our advisors will respond directly.
        </p>
      </div>

      {/* Success Notification Modal / Card */}
      {successData && (
        <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-emerald-950">Inquiry Submitted Successfully!</h3>
              <p className="text-sm text-emerald-800 mt-1">
                Thank you, <span className="font-semibold">{successData.name}</span>. Your inquiry reference number is{' '}
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">
                  #{successData.id}
                </span>. Our counselors will reach out to <span className="font-semibold">{successData.email}</span> shortly.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setSuccessData(null)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium transition shadow-xs"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to submit inquiry</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: User Type & Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Type Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  I am a... <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="user_type"
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
                  >
                    {USER_TYPES.map(ut => (
                      <option key={ut.value} value={ut.value}>
                        {ut.label} ({ut.desc})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">Select whether you are a Parent, Student, or School official</p>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Inquiry Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label} — {cat.tag}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">Scholarship, Concert, Admission, or General Query</p>
              </div>
            </div>

            {/* Step 2: Personal Details Row */}
            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                Personal & Contact Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Aarav Sharma"
                      className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                        fieldErrors.name
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                      }`}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. aarav@example.com"
                      className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                        fieldErrors.email
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 98765 43210"
                      className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                        fieldErrors.phone
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                      }`}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Message / Query Area */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Message / Query Details <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-400">
                  {formData.message.length} characters
                </span>
              </div>
              <textarea
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Please describe your specific inquiry, grade level, desired programs, or any special questions..."
                className={`w-full rounded-xl border p-3.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition resize-none ${
                  fieldErrors.message
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
              {fieldErrors.message && (
                <p className="text-xs text-rose-500 mt-1">{fieldErrors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving to Supabase Database...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info banner */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>🛡️ Your inquiry is stored securely in Supabase PostgreSQL</span>
          <span className="text-slate-400">Standard response turnaround: within 24 business hours</span>
        </div>
      </div>
    </div>
  );
};

export default PublicInquiryForm;
