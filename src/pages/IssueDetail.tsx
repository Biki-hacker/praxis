import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Issue, TimelineEntry, Comment } from '../types';
import { 
  ArrowLeft, MapPin, Calendar, User, Eye, CheckCircle2, MessageSquare, 
  Send, ThumbsUp, ShieldAlert, Clock, Sparkles, AlertCircle, Edit3 
} from 'lucide-react';

interface IssueDetailProps {
  issueId: string;
  setCurrentTab: (tab: string) => void;
}

export const IssueDetail: React.FC<IssueDetailProps> = ({ issueId, setCurrentTab }) => {
  const { 
    user, profile, issues, addComment, verifyIssue, updateIssueStatus, isDemoAccount, setIsDemoModalOpen 
  } = useAppStore();

  const issue = issues.find((i) => i.id === issueId);

  const [commentText, setCommentText] = useState('');
  const [verificationNote, setVerificationNote] = useState('');
  const [showOfficerControls, setShowOfficerControls] = useState(false);
  const [officerNote, setOfficerNote] = useState('');

  if (!issue) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-ink-muted">
        <AlertCircle size={32} className="mx-auto mb-2 text-ink-muted" />
        <p className="text-sm font-semibold">Issue report not found</p>
        <button 
          onClick={() => setCurrentTab('dashboard')} 
          className="mt-4 text-xs font-bold text-brand-primary hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Pothole': return '#F5C518';
      case 'Water': return '#3AABDB';
      case 'Light': return '#F59E0B';
      case 'Waste': return '#65A30D';
      case 'Infrastructure': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-status-critical-bg text-status-critical border-status-critical/10';
      case 'High':
        return 'bg-status-open-bg text-status-open border-status-open/10';
      case 'Medium':
        return 'bg-brand-light text-brand-primary border-brand-primary/10';
      default:
        return 'bg-bg-sunken text-ink-secondary border-ink-primary/5';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-status-open-bg text-status-open border-status-open/20';
      case 'in_progress':
        return 'bg-status-progress-bg text-status-progress border-status-progress/20';
      case 'resolved':
        return 'bg-status-resolved-bg text-status-resolved border-status-resolved/20';
      default:
        return 'bg-bg-sunken text-ink-muted border-ink-primary/10';
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoAccount) {
      setIsDemoModalOpen(true);
      return;
    }
    if (!commentText.trim()) return;
    await addComment(issue.id, commentText.trim());
    setCommentText('');
  };

  const handleVerify = async () => {
    if (isDemoAccount) {
      setIsDemoModalOpen(true);
      return;
    }
    await verifyIssue(issue.id, verificationNote.trim() || undefined);
    setVerificationNote('');
  };

  const handleStatusUpdate = async (status: Issue['status']) => {
    if (isDemoAccount) {
      setIsDemoModalOpen(true);
      return;
    }
    await updateIssueStatus(issue.id, status, officerNote.trim() || undefined);
    setOfficerNote('');
    setShowOfficerControls(false);
  };

  // Check if current user has already upvoted
  const hasUpvoted = user && issue.upvotedBy?.includes(user.uid);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-left">
      
      {/* Back button */}
      <button
        onClick={() => setCurrentTab('dashboard')}
        className="flex items-center gap-1.5 text-xs font-bold text-ink-secondary hover:text-brand-primary mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Map Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN (8/12): Core Issue Information */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="bg-bg-surface border border-ink-primary/5 rounded-2xl shadow-sm overflow-hidden p-6 flex flex-col">
            
            {/* Header meta badges */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 pb-4 border-b border-ink-primary/4">
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getCategoryColor(issue.category) }} 
                />
                <span className="text-xs font-bold text-ink-secondary uppercase font-mono tracking-wide">
                  {issue.category} Report
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold border uppercase tracking-wider ${getSeverityBadge(issue.severity)}`}>
                  {issue.severity} Severity
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${getStatusBadge(issue.status)}`}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Dynamic Image Carousel: Latest reported image first, then others to the right */}
            {(() => {
              const carouselImages: { url: string; label: string }[] = [];
              if (issue.resolvedMediaUrl) {
                carouselImages.push({ url: issue.resolvedMediaUrl, label: 'Resolved (After Repair)' });
              }
              if (issue.mediaUrls && issue.mediaUrls.length > 0) {
                // Ensure latest reported image is first
                issue.mediaUrls.forEach((url, i) => {
                  carouselImages.push({ url, label: `Reported Site Photo #${i + 1}` });
                });
              }

              if (carouselImages.length === 0) return null;

              // State for active carousel index
              const [activeImgIndex, setActiveImgIndex] = useState(0);

              return (
                <div className="flex flex-col gap-3 mb-6">
                  {/* Large Display Image */}
                  <div className="relative group overflow-hidden rounded-2xl border border-ink-primary/5 bg-bg-sunken h-[320px] w-full">
                    <img 
                      src={carouselImages[activeImgIndex]?.url} 
                      alt="Carousel Display" 
                      className="w-full h-full object-cover transition-all duration-500 hover:scale-[1.01]"
                    />
                    <div className="absolute bottom-3 left-3 bg-bg-base/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wide shadow-sm border border-ink-primary/5 uppercase">
                      {carouselImages[activeImgIndex]?.label}
                    </div>
                  </div>

                  {/* Thumbnails to the right strip */}
                  {carouselImages.length > 1 && (
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[9px] font-mono font-bold text-ink-muted uppercase">Image Vault (Latest First)</span>
                      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                        {carouselImages.map((img, idx) => {
                          const isActive = activeImgIndex === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => setActiveImgIndex(idx)}
                              className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                                isActive 
                                  ? 'border-brand-primary scale-95 shadow-sm' 
                                  : 'border-transparent opacity-65 hover:opacity-100'
                              }`}
                            >
                              <img src={img.url} alt="Thumb" className="w-full h-full object-cover" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <h1 className="font-display font-black text-2xl md:text-3xl text-ink-primary leading-tight tracking-tight mb-3">
              {issue.title}
            </h1>

            {/* Reported By block */}
            <div className="flex items-center gap-2.5 mb-6 text-xs text-ink-secondary">
              <img 
                src={issue.reportedByPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'} 
                alt={issue.reportedByName} 
                className="w-6 h-6 rounded-full border border-brand-primary"
              />
              <span>
                Reported by <span className="font-semibold text-ink-primary">{issue.reportedByName}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 font-mono">
                <Calendar size={11} />
                {new Date(issue.reportedAt).toLocaleDateString()}
              </span>
            </div>

            {/* Factual Description */}
            <p className="text-sm md:text-base text-ink-primary font-light leading-relaxed mb-6 whitespace-pre-wrap">
              {issue.description}
            </p>

            {/* AI description box if exists */}
            {issue.aiDescription && (
              <div className="bg-brand-light/30 border border-brand-primary/10 rounded-xl p-4 flex gap-3 text-left mb-6">
                <div className="p-1.5 bg-brand-primary text-white rounded-lg h-fit">
                  <Sparkles size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-black text-brand-primary uppercase leading-none mb-1">AI Analytical Diagnosis</span>
                  <p className="text-xs text-ink-secondary leading-relaxed font-light italic">
                    "{issue.aiDescription}"
                  </p>
                </div>
              </div>
            )}

            {/* Location Address Summary */}
            <div className="bg-bg-sunken border border-ink-primary/5 p-4 rounded-xl flex flex-col gap-2.5 text-xs text-ink-secondary">
              <div className="flex items-start gap-1.5">
                <MapPin size={14} className="text-brand-primary shrink-0 mt-0.5" />
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-ink-primary">Verified Location</span>
                  <span className="leading-relaxed font-light">{issue.address}</span>
                </div>
              </div>
              {issue.landmark && (
                <div className="flex items-center gap-1.5 pl-5 border-t border-ink-primary/5 pt-2">
                  <span className="font-bold text-ink-muted uppercase text-[10px] tracking-wider">Landmark:</span>
                  <span className="text-ink-primary">{issue.landmark}</span>
                </div>
              )}
            </div>

          </div>

          {/* Citizen Social & comments section */}
          <div className="bg-bg-surface border border-ink-primary/5 rounded-2xl shadow-sm p-6 flex flex-col gap-6">
            <h2 className="font-display font-black text-lg text-ink-primary flex items-center gap-2">
              <MessageSquare size={18} className="text-brand-primary" />
              Citizen Discussion Room
            </h2>

            {/* Post new comment box */}
            {user ? (
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask for updates, arrange cleanups, or clarify details..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-bg-sunken border border-transparent rounded-lg text-xs text-ink-primary outline-none focus:border-brand-primary/10"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2.5 bg-brand-primary hover:bg-brand-dark disabled:bg-ink-disabled disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                >
                  <Send size={12} />
                  Comment
                </button>
              </form>
            ) : (
              <div className="bg-bg-sunken p-3.5 rounded-lg text-center text-xs text-ink-secondary">
                Please login to participate in citizen discussions.
              </div>
            )}

            {/* Comment lists */}
            <div className="flex flex-col gap-3.5">
              {!issue.comments || issue.comments.length === 0 ? (
                <p className="text-xs text-ink-muted text-center py-4 font-light">No comments posted yet. Start the conversation!</p>
              ) : (
                issue.comments.map((c) => (
                  <div key={c.id} className="flex gap-3 text-left">
                    <img 
                      src={c.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'} 
                      alt={c.userName} 
                      className="w-7 h-7 rounded-full border border-ink-primary/10 shrink-0"
                    />
                    <div className="flex flex-col bg-bg-sunken/40 px-3.5 py-2 rounded-xl flex-1 max-w-[90%]">
                      <div className="flex items-center justify-between gap-2.5 mb-1">
                        <span className="text-xs font-bold text-ink-primary">{c.userName}</span>
                        <span className="text-[9px] font-mono text-ink-muted">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-ink-secondary font-light leading-relaxed">
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN (4/12): Verification, Timeline, & Officer Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* UPVOTE & VERIFY MODULE */}
          <div className="bg-bg-surface border border-ink-primary/5 rounded-2xl shadow-sm p-5 flex flex-col gap-4 text-center">
            <span className="text-[10px] font-mono font-black text-ink-muted uppercase tracking-wider block">Community Endorsements</span>
            <span className="font-display font-black text-3xl text-brand-primary leading-none">
              {issue.upvoteCount || 0}
            </span>
            <p className="text-xs text-ink-secondary font-light max-w-xs mx-auto leading-relaxed">
              Vouch for this report to raise priority. Upvoted reports get highlighted on municipal inspector dashboards.
            </p>

            {user ? (
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    if (isDemoAccount) {
                      setIsDemoModalOpen(true);
                    } else {
                      verifyIssue(issue.id);
                    }
                  }}
                  disabled={hasUpvoted}
                  className={`w-full py-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    hasUpvoted 
                      ? 'bg-status-resolved-bg text-status-resolved border border-status-resolved/20 cursor-default' 
                      : 'bg-brand-primary hover:bg-brand-dark text-white shadow-sm hover:scale-102 cursor-pointer'
                  }`}
                >
                  <ThumbsUp size={13} />
                  {hasUpvoted ? 'Vouched & Endorsed' : 'Vouch for this Issue (+15 XP)'}
                </button>

                {/* Physical verification box */}
                <div className="h-[1px] bg-ink-primary/8 my-1"></div>
                <div className="text-left flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-ink-secondary uppercase">Submit Physical Verification note</label>
                  <textarea
                    placeholder="Saw this pothole today? Describe its current status to submit physical audit proof..."
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2 bg-bg-sunken rounded border border-transparent focus:border-brand-primary/10 outline-none"
                  />
                  <button
                    onClick={handleVerify}
                    disabled={!verificationNote.trim()}
                    className="w-full py-2 bg-bg-sunken hover:bg-bg-sunken/80 disabled:bg-bg-sunken disabled:text-ink-disabled disabled:cursor-not-allowed text-ink-primary text-xs font-bold rounded border border-ink-primary/5 transition-all"
                  >
                    Submit Physical Audit (+25 XP)
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-bg-sunken p-3.5 rounded-xl text-xs text-ink-secondary mt-2">
                Please login to verify this issue.
              </div>
            )}
          </div>          {/* TIMELINE TRACKER: Dynamic Single Timeline with exactly two entries (Citizen & Officials) */}
          <div className="bg-bg-surface border border-ink-primary/5 rounded-2xl shadow-sm p-5 flex flex-col gap-4 text-left">
            <h3 className="text-[10px] font-mono font-black text-ink-muted uppercase tracking-wider">Resolution Timeline</h3>
            
            <div className="flex flex-col gap-6 relative pl-3.5 border-l border-ink-primary/8 ml-2">
              
              {/* Entry 1: CITIZEN LOG */}
              <div className="relative flex flex-col gap-1.5 text-xs">
                {/* Bullet node */}
                <div className="absolute -left-[20px] top-1 w-2 h-2 rounded-full border border-white bg-brand-primary" />
                
                <div className="flex justify-between items-center text-[10px] text-ink-muted font-mono font-black">
                  <span className="text-brand-primary">1. CITIZEN OUTAGE REGISTRATION</span>
                  <span>{new Date(issue.reportedAt).toLocaleDateString()}</span>
                </div>
                <span className="text-ink-secondary leading-normal font-light">
                  Logged by <strong className="font-semibold text-ink-primary">{issue.reportedByName || 'Citizen'}</strong> with category <strong className="font-semibold">{issue.category}</strong>. Landmark: {issue.landmark || 'Not specified'}. Community vouch score: {issue.upvoteCount || 0} upvotes.
                </span>
              </div>

              {/* Entry 2: MUNICIPAL OFFICIAL ACTION */}
              <div className="relative flex flex-col gap-1.5 text-xs">
                {/* Bullet node depending on state */}
                <div className={`absolute -left-[20px] top-1 w-2 h-2 rounded-full border border-white ${
                  issue.status === 'resolved' 
                    ? 'bg-status-resolved animate-pulse' 
                    : issue.status === 'in_progress'
                      ? 'bg-brand-primary'
                      : 'bg-ink-muted'
                }`} />

                <div className="flex justify-between items-center text-[10px] text-ink-muted font-mono font-black">
                  <span className={issue.status === 'resolved' ? 'text-status-resolved' : 'text-ink-secondary'}>
                    2. MUNICIPAL DISPATCH &amp; AI INSPECTION
                  </span>
                  {issue.resolvedAt && (
                    <span>{new Date(issue.resolvedAt).toLocaleDateString()}</span>
                  )}
                </div>

                {issue.status === 'resolved' ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-ink-secondary leading-normal font-light">
                      Dispatch crews resolved the outage. The repair works were audited and approved by the **AI Resolution Inspection Engine**.
                    </span>
                    <span className="text-[11px] font-light text-status-resolved italic bg-status-resolved-bg/20 p-2.5 rounded-lg border border-status-resolved/10 leading-normal">
                      "AI Diagnosis: Verification photo matched repairs successfully. {issue.aiVerificationResult || 'Status completed.'}"
                    </span>
                  </div>
                ) : issue.status === 'in_progress' ? (
                  <span className="text-brand-primary leading-normal font-semibold">
                    Work order active. Road construction crews assigned to site location coordinates.
                  </span>
                ) : (
                  <span className="text-ink-muted leading-normal font-light">
                    Awaiting municipal official assignment. Progress logs will update automatically once assigned.
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* MUNICIPAL OFFICER CONTROLS (Only administrative officials can view/access) */}
          {(() => {
            const isAuthority = profile?.role === 'authority' || profile?.role === 'admin';
            if (!isAuthority) return null;

            return (
              <div className="bg-bg-surface border border-status-critical/15 rounded-2xl shadow-sm p-5 flex flex-col gap-3 text-left animate-fadeIn">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert size={16} className="text-status-critical shrink-0" />
                  <h3 className="text-xs font-bold text-ink-primary uppercase tracking-wide">Inspector Control Console</h3>
                </div>
                
                <p className="text-[11px] text-ink-secondary leading-relaxed font-light">
                  Inspectors can update resolving status. Original reporter gets <span className="font-bold text-status-resolved font-mono">+100 XP</span> when status shifts to Resolved.
                </p>

                <div className="flex flex-col gap-2 mt-1">
                  <button
                    onClick={() => setShowOfficerControls(!showOfficerControls)}
                    className="w-full py-2 bg-status-critical-bg text-status-critical hover:bg-status-critical/10 text-xs font-bold rounded-xl border border-status-critical/10 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit3 size={12} />
                    {showOfficerControls ? 'Hide Officer Console' : 'Access Officer Console'}
                  </button>

                  {showOfficerControls && (
                    <div className="flex flex-col gap-2.5 pt-2 border-t border-ink-primary/5 mt-1 animate-fadeIn">
                      <label className="text-[10px] font-bold text-ink-secondary uppercase">Progress Note</label>
                      <textarea
                        placeholder="e.g. Dispatched paving mixer truck #4..."
                        value={officerNote}
                        onChange={(e) => setOfficerNote(e.target.value)}
                        rows={2}
                        className="w-full text-xs p-2 bg-bg-sunken rounded border border-transparent focus:border-brand-primary/10 outline-none"
                      />

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => handleStatusUpdate('open')}
                          className="py-1.5 bg-bg-sunken text-ink-secondary hover:bg-ink-primary/10 text-[10px] font-bold rounded cursor-pointer"
                        >
                          Reset Open
                        </button>
                        <button
                          onClick={() => handleStatusUpdate('in_progress')}
                          className="py-1.5 bg-brand-light text-brand-primary hover:bg-brand-primary hover:text-white text-[10px] font-bold rounded transition-all cursor-pointer"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => handleStatusUpdate('resolved')}
                          className="py-1.5 bg-status-resolved-bg text-status-resolved hover:bg-status-resolved hover:text-white text-[10px] font-bold rounded transition-all cursor-pointer"
                        >
                          Resolve (+100 XP)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        </div>

      </div>

    </div>
  );
};
