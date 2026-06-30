import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Zap, Trophy, Shield, Loader2, RefreshCw } from 'lucide-react';
import { getAvatarSvg } from '../utils/avatar';

export const Leaderboard: React.FC = () => {
  const { user } = useAppStore();
  const [boardData, setBoardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setBoardData(data);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getLevelName = (level: number, displayName?: string) => {
    if (displayName) {
      if (displayName.includes('Aniket Banerjee')) return 'Resident';
      if (displayName.includes('Priyanka Das')) return 'Observer';
    }
    return level % 2 === 1 ? 'Resident' : 'Observer';
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-left animate-fadeIn">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-black text-3xl md:text-5xl text-ink-primary leading-tight tracking-tight mb-2">
            Civic Leaders
          </h1>
          <p className="text-sm text-ink-secondary font-light">
            Citizens who lead physical audits, report structural hazards, and contribute to resolving municipal outages.
          </p>
        </div>
        
        <button
          onClick={fetchLeaderboard}
          className="flex items-center justify-center gap-1.5 px-4 py-2 border border-ink-primary/10 hover:border-ink-primary/20 hover:bg-bg-sunken bg-white text-ink-secondary text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-brand-primary' : ''} />
          Refresh Standings
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
        </div>
      ) : (
        <div className="bg-bg-surface border border-ink-primary/5 rounded-2xl shadow-md overflow-hidden">
          
          <div className="px-6 py-4 bg-bg-elevated border-b border-ink-primary/5 grid grid-cols-12 gap-3 text-xs font-bold text-ink-muted uppercase tracking-wider">
            <div className="col-span-2 md:col-span-1 text-center">Rank</div>
            <div className="col-span-6 md:col-span-7">Citizen Champion</div>
            <div className="col-span-2 text-center">Level</div>
            <div className="col-span-2 text-right">Civic XP</div>
          </div>

          <div className="divide-y divide-ink-primary/4">
            {boardData.map((player, idx) => {
              const isCurrentUser = user && player.uid === user.uid;

              return (
                <div
                  key={player.uid}
                  className={`px-6 py-4 grid grid-cols-12 gap-3 items-center text-left ${
                    isCurrentUser ? 'bg-brand-light/30 border-y border-brand-primary/10' : 'hover:bg-bg-sunken/10'
                  }`}
                >
                  {/* Rank badge */}
                  <div className="col-span-2 md:col-span-1 text-center font-mono font-bold text-sm text-ink-secondary">
                    {getRankBadge(idx)}
                  </div>

                  {/* Profile Info */}
                  <div className="col-span-6 md:col-span-7 flex items-center gap-3">
                    <img
                      src={getAvatarSvg(player.displayName || 'User', player.email || player.uid)}
                      alt={player.displayName}
                      className="w-9 h-9 rounded-full border border-ink-primary/5 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-ink-primary truncate">
                        {player.displayName}
                        {isCurrentUser && (
                          <span className="text-[9px] bg-brand-primary text-white font-bold ml-1.5 px-1.5 py-0.5 rounded">YOU</span>
                        )}
                      </span>
                      <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wide">
                        {getLevelName(player.level || 1, player.displayName)}
                      </span>
                    </div>
                  </div>

                  {/* Level Badge */}
                  <div className="col-span-2 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-bg-sunken border border-ink-primary/5 text-xs font-mono font-black text-ink-secondary leading-none">
                      {player.level || 1}
                    </span>
                  </div>

                  {/* XP Gained */}
                  <div className="col-span-2 text-right font-display font-black text-sm md:text-base text-brand-primary">
                    {player.xp || 10}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Gamification rules explanatory panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-5 rounded-2xl border border-ink-primary/5 bg-bg-surface flex gap-3 text-left">
          <div className="p-2 bg-brand-light text-brand-primary rounded-lg h-fit">
            <Zap size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink-primary uppercase leading-tight mb-1">Report Issues</h4>
            <p className="text-[11px] text-ink-secondary font-light">
              Submit local potholes, dark streets, or flooding to gain <span className="font-semibold text-brand-primary font-mono">+50 XP</span> instantly.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-ink-primary/5 bg-bg-surface flex gap-3 text-left">
          <div className="p-2 bg-status-open-bg text-status-open rounded-lg h-fit">
            <Trophy size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink-primary uppercase leading-tight mb-1">Vouch & Audit</h4>
            <p className="text-[11px] text-ink-secondary font-light">
              Upvote reports or submit physical witness audits to earn <span className="font-semibold text-status-open font-mono">+25 XP</span>.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-ink-primary/5 bg-bg-surface flex gap-3 text-left">
          <div className="p-2 bg-status-resolved-bg text-status-resolved rounded-lg h-fit">
            <Shield size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink-primary uppercase leading-tight mb-1">See Resolution</h4>
            <p className="text-[11px] text-ink-secondary font-light">
              When authorities fix an issue you reported, get a bonus of <span className="font-semibold text-status-resolved font-mono">+100 XP</span>.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
