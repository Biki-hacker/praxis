import React, { useState } from 'react';
import { AppProvider, useAppStore } from './store';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ReportIssue } from './pages/ReportIssue';
import { IssueDetail } from './pages/IssueDetail';
import { Leaderboard } from './pages/Leaderboard';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import { InspectorConsole } from './pages/InspectorConsole';
import { CitizenConsole } from './pages/CitizenConsole';
import { Auth } from './pages/Auth';
import { X, Lock } from 'lucide-react';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const { user, isDemoModalOpen, setIsDemoModalOpen } = useAppStore();

  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-bg-base text-ink-primary flex flex-col font-sans antialiased relative">
      
      {/* Dynamic Header Navbar */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        openReportModal={handleOpenReportModal} 
      />

      {/* Main Screen Router Switch */}
      <main className="flex-1 w-full flex flex-col">
        {currentTab === 'landing' && <Landing setCurrentTab={setCurrentTab} />}
        {currentTab === 'dashboard' && (
          <Dashboard 
            setCurrentTab={setCurrentTab} 
            setSelectedIssueId={setSelectedIssueId} 
            openReportModal={handleOpenReportModal}
          />
        )}
        {currentTab === 'issue-detail' && (
          <IssueDetail 
            issueId={selectedIssueId} 
            setCurrentTab={setCurrentTab} 
          />
        )}
        {currentTab === 'analytics' && <Analytics />}
        {currentTab === 'leaderboard' && <Leaderboard />}
        {currentTab === 'auth' && <Auth setCurrentTab={setCurrentTab} />}
        {currentTab === 'admin-console' && (
          <InspectorConsole 
            setCurrentTab={setCurrentTab} 
            setSelectedIssueId={setSelectedIssueId} 
          />
        )}
        {currentTab === 'citizen-console' && (
          <CitizenConsole 
            setCurrentTab={setCurrentTab} 
            setSelectedIssueId={setSelectedIssueId} 
          />
        )}
        {currentTab === 'profile' && (
          <Profile 
            setCurrentTab={setCurrentTab} 
            setSelectedIssueId={setSelectedIssueId} 
          />
        )}
      </main>

      {/* FLOATING DIALOG: Multi-step Issue Report wizard Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/40 backdrop-blur-sm overflow-y-auto">
          <div className="relative bg-bg-base border border-ink-primary/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-left">
            
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-ink-primary/5 bg-bg-elevated sticky top-0 z-10">
              <h3 className="font-display font-black text-lg text-ink-primary">File Hyperlocal Civic Outage</h3>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 text-ink-muted hover:text-ink-primary rounded-full hover:bg-bg-sunken transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body with Scrollable Report Flow */}
            <div className="overflow-y-auto flex-1">
              <ReportIssue 
                setCurrentTab={setCurrentTab} 
                closeModal={() => setIsReportModalOpen(false)} 
              />
            </div>

          </div>
        </div>
      )}

      {/* DEMO BLOCK MODAL */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-primary/60 backdrop-blur-md">
          <div className="relative bg-bg-surface border border-status-critical/25 rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-8 text-center flex flex-col items-center gap-4 animate-scaleUp">
            
            {/* Warning Icon */}
            <div className="p-4 bg-status-critical-bg text-status-critical rounded-full">
              <Lock size={32} />
            </div>

            <h3 className="font-display font-black text-xl text-ink-primary">Sign-In / Registration Required</h3>
            
            <p className="text-xs text-ink-secondary leading-relaxed font-light">
              You are currently using a <strong>Demo Account</strong>. Action on actual civic reports (like submitting new reports, adding comments, vouching, or updating outages) is restricted to verified registered accounts to keep our database secure and high quality.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
              <button
                onClick={() => {
                  setIsDemoModalOpen(false);
                  setIsReportModalOpen(false); // Close report modal if open
                  setCurrentTab('auth');
                }}
                className="flex-1 py-3 bg-brand-primary hover:bg-brand-dark text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Sign In / Register
              </button>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="flex-1 py-3 border border-ink-primary/10 hover:bg-bg-sunken/40 text-ink-secondary rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                Stay as Guest
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
