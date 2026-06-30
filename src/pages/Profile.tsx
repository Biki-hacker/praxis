import React from 'react';
import { useAppStore } from '../store';
import { Shield, Award, MapPin, Calendar, Clock, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { getAvatarSvg } from '../utils/avatar';

interface ProfileProps {
  setCurrentTab: (tab: string) => void;
  setSelectedIssueId: (id: string) => void;
}

const BADGES = [
  { id: 'first_login', name: 'Planted Roots', icon: '🌱', desc: 'Signed in and joined the community.' },
  { id: 'first_report', name: 'First Report', icon: '📍', desc: 'Logged your very first civic incident.' },
  { id: 'eagle_eye', name: 'Eagle Eye', icon: '🦅', desc: 'Logged over 5 civic issues.' },
  { id: 'truth_seeker', name: 'Truth Seeker', icon: '🔍', desc: 'Physically audited/verified over 5 reports.' },
  { id: 'top_reporter', name: 'Local Hero', icon: '🏆', desc: 'Amassed over 1,000 community XP.' },
];

export const Profile: React.FC<ProfileProps> = ({ setCurrentTab, setSelectedIssueId }) => {
  const { user, profile, issues } = useAppStore();

  if (!user || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-ink-muted animate-fadeIn">
        <Lock size={32} className="mx-auto mb-2 text-ink-muted" />
        <p className="text-sm font-semibold">Protected View</p>
        <p className="text-xs">Please sign in with your Google account to explore your profile stats.</p>
      </div>
    );
  }

  // Calculate Level and XP limits
  const currentXP = profile.xp || 10;
  const currentLevel = profile.level || 1;
  const xpInCurrentLevel = currentXP % 500;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / 500) * 100));
  const xpNeeded = 500 - xpInCurrentLevel;

  const getLevelName = (level: number, displayName?: string) => {
    if (displayName) {
      if (displayName.includes('Aniket Banerjee')) return 'Resident';
      if (displayName.includes('Priyanka Das')) return 'Observer';
    }
    return level % 2 === 1 ? 'Resident' : 'Observer';
  };

  // Filter issues reported by this user
  const userIssues = issues.filter((i) => i.reportedBy === user.uid);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-left animate-fadeIn">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Profile Header Card & Level Progress (5/12) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-bg-surface border border-ink-primary/5 rounded-2xl shadow-sm p-6 text-center relative overflow-hidden">
            <div className="absolute top-4 right-4 text-brand-primary">
              <Shield size={20} className="opacity-40" />
            </div>

            <img
              src={getAvatarSvg(profile.displayName || user.displayName || 'User', profile.email || user.email)}
              alt={profile.displayName}
              className="w-20 h-20 rounded-full border border-ink-primary/5 mx-auto mb-4 object-cover"
              referrerPolicy="no-referrer"
            />

            <h2 className="font-display font-black text-xl text-ink-primary tracking-tight leading-none mb-1">
              {profile.displayName}
            </h2>
            <span className="text-xs font-mono font-bold text-brand-primary uppercase tracking-wide">
              {getLevelName(currentLevel, profile.displayName)} (Lvl {currentLevel})
            </span>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-ink-muted font-mono mt-3 mb-6">
              <Calendar size={11} />
              Joined {new Date(profile.joinedAt || Date.now()).toLocaleDateString()}
            </div>

            {/* Stats count grid */}
            <div className="grid grid-cols-3 gap-2.5 bg-bg-sunken border border-ink-primary/5 p-4 rounded-xl text-center">
              <div className="flex flex-col">
                <span className="font-display font-black text-lg text-ink-primary leading-none mb-0.5">
                  {profile.issuesReported || 0}
                </span>
                <span className="text-[9px] font-bold text-ink-muted uppercase">Reports</span>
              </div>
              <div className="flex flex-col border-x border-ink-primary/10">
                <span className="font-display font-black text-lg text-ink-primary leading-none mb-0.5">
                  {profile.issuesVerified || 0}
                </span>
                <span className="text-[9px] font-bold text-ink-muted uppercase">Audits</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-lg text-ink-primary leading-none mb-0.5">
                  {profile.issuesResolved || 0}
                </span>
                <span className="text-[9px] font-bold text-ink-muted uppercase">Resolved</span>
              </div>
            </div>
          </div>

          {/* XP Progress Slider Card */}
          <div className="bg-bg-surface border border-ink-primary/5 rounded-2xl shadow-sm p-6 text-left">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-mono font-black text-ink-muted uppercase tracking-wide">Level Advancement</span>
              <span className="text-xs font-bold text-brand-primary font-mono">{currentXP} Total XP</span>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full bg-bg-sunken h-3 rounded-full overflow-hidden relative border border-ink-primary/5 mb-3.5">
              <div 
                className="bg-brand-primary h-full rounded-full transition-all duration-500 shadow-inner"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-ink-secondary leading-none">
              <span className="font-semibold text-ink-primary">Level {currentLevel}</span>
              <span className="font-mono font-bold text-brand-primary">{xpNeeded} XP to Level {currentLevel + 1}</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Badges earned & Report History list (7/12) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* BADGES SHELF */}
          <div className="bg-bg-surface border border-ink-primary/5 rounded-2xl p-6 shadow-sm text-left">
            <h3 className="font-display font-black text-lg text-ink-primary mb-4 flex items-center gap-1.5">
              <Award size={18} className="text-brand-primary" />
              Civic Badges
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BADGES.map((badge) => {
                const userHasBadge = profile.badges?.includes(badge.id);

                return (
                  <div 
                    key={badge.id}
                    className={`flex gap-3.5 p-3 rounded-xl border transition-all ${
                      userHasBadge 
                        ? 'bg-bg-elevated border-brand-primary/10 hover:border-brand-primary/30 shadow-sm' 
                        : 'bg-bg-sunken/40 border-transparent opacity-60'
                    }`}
                  >
                    <div className="text-3xl shrink-0 flex items-center justify-center p-1 bg-white border border-ink-primary/5 shadow-sm rounded-xl w-12 h-12">
                      {userHasBadge ? badge.icon : '🔒'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-xs font-bold ${userHasBadge ? 'text-ink-primary' : 'text-ink-muted'}`}>
                        {badge.name}
                      </span>
                      <p className="text-[10px] text-ink-secondary leading-normal font-light mt-0.5">
                        {badge.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MY REPORTS HISTORY LIST */}
          <div className="bg-bg-surface border border-ink-primary/5 rounded-2xl p-6 shadow-sm text-left">
            <h3 className="font-display font-black text-lg text-ink-primary mb-4 flex items-center gap-1.5">
              <Clock size={18} className="text-brand-primary" />
              My Reported Outages ({userIssues.length})
            </h3>

            {userIssues.length === 0 ? (
              <p className="text-xs text-ink-muted text-center py-6 font-light">
                You haven't reported any civic outages yet. Click "+ Report Issue" on the dashboard to start!
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-ink-primary/5">
                {userIssues.map((issue) => (
                  <div 
                    key={issue.id}
                    onClick={() => {
                      setSelectedIssueId(issue.id);
                      setCurrentTab('issue-detail');
                    }}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-bg-sunken/10 px-2 rounded-lg cursor-pointer group transition-all"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-ink-primary group-hover:text-brand-primary truncate leading-snug">
                        {issue.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-ink-muted font-mono uppercase font-bold">
                        <span>{issue.category}</span>
                        <span>•</span>
                        <span>{issue.status}</span>
                      </div>
                    </div>
                    
                    <ChevronRight size={14} className="text-ink-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
