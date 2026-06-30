import React, { useState } from 'react';
import { useAppStore } from '../store';
import { getIssuePlaceholderSvg } from '../utils/issuePlaceholder';
import { 
  UserCheck, MapPin, Calendar, Clock, CheckCircle2, ArrowRight, Sparkles, 
  ThumbsUp, ShieldAlert, ChevronRight, CheckCircle, AlertCircle, FileText
} from 'lucide-react';

interface CitizenConsoleProps {
  setCurrentTab: (tab: string) => void;
  setSelectedIssueId: (id: string) => void;
}

export const CitizenConsole: React.FC<CitizenConsoleProps> = ({ setCurrentTab, setSelectedIssueId }) => {
  const { user, profile, issues, login } = useAppStore();
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  // If not logged in, prompt sign in
  if (!user) {
    return (
      <div className="max-w-md mx-auto w-full px-4 py-16 text-center">
        <div className="bg-bg-surface border border-ink-primary/5 rounded-3xl p-8 shadow-xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-brand-light text-brand-primary flex items-center justify-center mb-4 animate-pulse">
            <UserCheck size={32} />
          </div>
          <h2 className="font-display font-black text-xl text-ink-primary mb-2">Sign In to Track Status</h2>
          <p className="text-xs text-ink-secondary leading-relaxed font-light mb-6">
            Log in to access your custom citizen console, track your logged outages, upvote reports, and earn civic points.
          </p>
          <button
            onClick={() => setCurrentTab('auth')}
            className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Access Portal
          </button>
        </div>
      </div>
    );
  }

  // Filter issues created by the current user
  const myIssues = issues.filter(issue => 
    issue.reportedBy === user.uid || 
    issue.reportedBy === user.email || 
    issue.reportedBy === user.displayName
  );

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8 text-left">
      
      {/* Header section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <UserCheck className="text-brand-primary shrink-0" size={20} />
          <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight text-ink-primary">
            Citizen Status Console
          </h1>
        </div>
        <p className="text-xs text-ink-secondary font-light">
          Hyperlocal Civic Outage Tracking • Real-time municipal inspector feeds and verified resolution timelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CITIZEN SUBMITTED REPORTS LIST (LEFT 5 COLUMNS) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h2 className="text-[10px] font-mono font-black text-ink-muted uppercase tracking-wider">
            My Submitted Outages ({myIssues.length})
          </h2>

          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {myIssues.map((issue) => {
              const isSelected = selectedIssue?.id === issue.id;
              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-primary bg-brand-light/40 shadow-md scale-[1.01]'
                      : 'border-ink-primary/5 bg-bg-surface hover:bg-bg-sunken/40 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                      issue.status === 'open'
                        ? 'bg-status-open-bg text-status-open border-status-open/10'
                        : issue.status === 'in_progress'
                          ? 'bg-brand-light text-brand-primary border-brand-primary/10'
                          : 'bg-status-resolved-bg text-status-resolved border-status-resolved/10'
                    }`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] text-ink-muted font-mono font-light">
                      {new Date(issue.reportedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-ink-primary truncate mb-1">
                    {issue.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 text-[10px] text-ink-secondary">
                    <span className="flex items-center gap-1">
                      <MapPin size={10} className="text-ink-muted" />
                      <span className="truncate max-w-[120px]">{issue.landmark || 'No Landmark'}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono text-brand-primary font-bold">
                      <ThumbsUp size={10} />
                      {issue.upvotes || 0} Upvotes
                    </span>
                  </div>
                </div>
              );
            })}

            {myIssues.length === 0 && (
              <div className="bg-bg-surface border border-ink-primary/5 rounded-2xl p-8 text-center text-xs text-ink-secondary">
                <p className="font-medium text-ink-primary mb-1">No reports filed yet</p>
                <p className="font-light text-[11px]">Click "Report Issue" in the navigation bar to register your first local outage.</p>
              </div>
            )}
          </div>
        </div>

        {/* DETAILED TIMELINE CHRONOLOGY (RIGHT 7 COLUMNS) */}
        <div className="lg:col-span-7">
          {selectedIssue ? (
            <div className="bg-bg-surface border border-ink-primary/5 rounded-3xl p-6 shadow-md flex flex-col gap-6 animate-fadeIn">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-ink-primary/5 pb-4">
                <div>
                  <span className="text-[9px] font-mono text-ink-muted uppercase font-black tracking-wider leading-none">Status Details</span>
                  <h2 className="text-base font-black text-ink-primary mt-1">{selectedIssue.title}</h2>
                  <span className="text-xs font-mono font-bold text-brand-primary bg-brand-light/40 px-2 py-0.5 rounded-full mt-1.5 inline-block border border-brand-primary/5">
                    {selectedIssue.category} Outage
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedIssueId(selectedIssue.id);
                    setCurrentTab('issue-detail');
                  }}
                  className="px-3 py-1.5 bg-bg-sunken hover:bg-bg-elevated text-ink-secondary text-[10px] font-bold rounded-full transition-all flex items-center gap-1 cursor-pointer"
                >
                  Deep Dive <ChevronRight size={12} />
                </button>
              </div>

              {/* Photos Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-mono font-bold text-ink-muted uppercase block mb-1.5">Original Citizen Report</span>
                  <img 
                    src={(selectedIssue.mediaUrls?.[0] && !selectedIssue.mediaUrls[0].includes('unsplash.com')) ? selectedIssue.mediaUrls[0] : getIssuePlaceholderSvg(selectedIssue.category)} 
                    alt="Before" 
                    className="w-full h-36 object-cover rounded-2xl border border-ink-primary/5"
                  />
                </div>

                <div>
                  <span className="text-[9px] font-mono font-bold text-ink-muted uppercase block mb-1.5">Resolved Repair state</span>
                  {selectedIssue.resolvedMediaUrl ? (
                    <img 
                      src={selectedIssue.resolvedMediaUrl} 
                      alt="After" 
                      className="w-full h-36 object-cover rounded-2xl border border-status-resolved/20 shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-36 bg-bg-sunken/40 border border-dashed border-ink-primary/10 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                      <Clock size={16} className="text-ink-muted mb-1 animate-spin" />
                      <span className="text-[11px] font-bold text-ink-secondary">Repair Pending</span>
                      <span className="text-[9px] text-ink-muted font-light mt-0.5">Official photo will appear post inspection approval.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* TWO-ENTRY SINGLE RESOLUTION TIMELINE (CITIZEN & OFFICIAL) */}
              <div className="border-t border-ink-primary/5 pt-5">
                <h3 className="text-xs font-black text-ink-primary uppercase tracking-wide mb-5 flex items-center gap-1.5">
                  <Clock size={14} className="text-brand-primary" />
                  Resolution Timeline
                </h3>

                <div className="relative pl-6 border-l-2 border-brand-primary/10 flex flex-col gap-6 text-xs">
                  
                  {/* CITIZEN TIMELINE ENTRY (FIRST STEP) */}
                  <div className="relative">
                    {/* Circle marker */}
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-brand-primary bg-bg-surface flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                    </div>

                    <div className="flex flex-col gap-1.5 bg-bg-sunken/30 rounded-2xl p-4 border border-ink-primary/5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-primary text-[11px] uppercase tracking-wide">Citizen Outage Logged</span>
                        <span className="text-[9px] text-ink-muted font-mono">{new Date(selectedIssue.reportedAt).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[11px] font-light leading-relaxed text-ink-secondary">
                        Logged by <strong className="font-semibold">{selectedIssue.reportedBy || 'Local Resident'}</strong> at coordinate <strong>{selectedIssue.lat.toFixed(4)}, {selectedIssue.lng.toFixed(4)}</strong> with initial severity <strong>{selectedIssue.severity || 'Medium'}</strong>.
                      </span>
                    </div>
                  </div>

                  {/* OFFICIAL TIMELINE ENTRY (SECOND STEP) */}
                  <div className="relative">
                    {/* Circle marker depending on state */}
                    <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-bg-surface flex items-center justify-center ${
                      selectedIssue.status === 'resolved' 
                        ? 'border-status-resolved' 
                        : selectedIssue.status === 'in_progress'
                          ? 'border-brand-primary'
                          : 'border-ink-muted'
                    }`}>
                      {selectedIssue.status === 'resolved' ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-status-resolved animate-ping"></div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-ink-muted"></div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 bg-bg-sunken/30 rounded-2xl p-4 border border-ink-primary/5">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-[11px] uppercase tracking-wide ${
                          selectedIssue.status === 'resolved' 
                            ? 'text-status-resolved' 
                            : 'text-ink-secondary'
                        }`}>
                          Municipal Action &amp; AI Audit
                        </span>
                        {selectedIssue.resolvedAt && (
                          <span className="text-[9px] text-ink-muted font-mono">
                            {new Date(selectedIssue.resolvedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {selectedIssue.status === 'resolved' ? (
                        <div className="flex flex-col gap-1 text-ink-secondary">
                          <span className="text-[11px] font-light leading-relaxed">
                            Municipal maintenance crews were dispatched. The repair was completed and verified via the **AI GPS Proximity Resolution Engine**.
                          </span>
                          <div className="mt-2 text-[10px] bg-status-resolved-bg/25 border border-status-resolved/10 rounded-lg p-2.5 flex items-start gap-1.5">
                            <Sparkles size={11} className="text-status-resolved shrink-0 mt-0.5" />
                            <p className="italic leading-normal text-ink-primary">
                              "{selectedIssue.aiVerificationResult || 'AI successfully matched repair works in after-photo.'}"
                            </p>
                          </div>
                        </div>
                      ) : selectedIssue.status === 'in_progress' ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-brand-primary font-bold">
                            Work Order Created • Active
                          </span>
                          <span className="text-[11px] text-ink-muted font-light leading-relaxed">
                            Municipal dispatch crews have acknowledged this report. Maintenance trucks are assigned to resolve the site outage.
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-ink-muted font-light">
                          Awaiting municipal inspection. Once staff are dispatched, repair progress details will populate here.
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="bg-bg-surface border border-ink-primary/5 rounded-3xl p-12 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
              <Clock size={32} className="text-ink-muted mb-3" />
              <h3 className="font-display font-bold text-sm text-ink-primary">Select Outage to Check Status</h3>
              <p className="text-xs text-ink-secondary font-light max-w-xs leading-normal mt-1">
                Select any incident from your log on the left to see the official resolution status and check the real-time repair timeline.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
