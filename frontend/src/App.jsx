import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PublicInquiryForm from './components/PublicInquiryForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';

const MainContent = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('public'); // 'public' | 'admin'
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleTabChange = (tab) => {
    if (tab === 'admin' && !isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setActiveTab('admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenLoginModal={() => setShowLoginModal(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'public' ? (
          <PublicInquiryForm
            onInquirySubmitted={() => {
              // Optionally could notify admin or switch
            }}
          />
        ) : isAuthenticated ? (
          <AdminDashboard />
        ) : (
          <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-lg">
            <h2 className="text-xl font-bold text-slate-900">Admin Authentication Required</h2>
            <p className="text-sm text-slate-600 mt-2 mb-6">
              Please log in with administrator credentials to access the protected inquiry management dashboard.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition shadow-md shadow-indigo-200"
            >
              Sign In to Admin Portal
            </button>
          </div>
        )}
      </main>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <AdminLogin
          onSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Persistent Assessment Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">EdTech CRM & Inquiry System</span>
            <span>—</span>
            <span>Full-Stack Assessment</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Supabase PostgreSQL</span>
            <span>•</span>
            <span>Custom JWT Auth (Node.js/Express)</span>
            <span>•</span>
            <span>React & Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
