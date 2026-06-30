import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Shield, MapPin, BarChart2, Award, User as UserIcon, LogOut, Plus, Menu, X } from 'lucide-react';
import { getAvatarSvg } from '../utils/avatar';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openReportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openReportModal }) => {
  const { user, profile, login, logout } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthority = profile?.role === 'authority' || profile?.role === 'admin';

  const navItems = isAuthority 
    ? [
        { id: 'dashboard', label: 'Map Dashboard', icon: MapPin },
        { id: 'admin-console', label: 'Inspector Console', icon: Shield },
        { id: 'leaderboard', label: 'Leaderboard', icon: Award },
        ...(user ? [{ id: 'profile', label: 'Official Profile', icon: UserIcon }] : []),
      ]
    : [
        { id: 'dashboard', label: 'Map Dashboard', icon: MapPin },
        { id: 'citizen-console', label: 'Citizen Console', icon: UserIcon },
        { id: 'analytics', label: 'Impact Analytics', icon: BarChart2 },
        { id: 'leaderboard', label: 'Leaderboard', icon: Award },
        ...(user ? [{ id: 'profile', label: 'My Civic Profile', icon: UserIcon }] : []),
      ];

  return (
    <nav className="sticky top-0 z-50 bg-bg-base/80 backdrop-blur-md border-b border-ink-primary/8 px-4 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => { setCurrentTab('landing'); setMobileMenuOpen(false); }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-brand-primary text-white shadow-md group-hover:scale-105 transition-all duration-300">
            <MapPin size={18} className="z-10 group-hover:rotate-12 transition-transform" />
            <div className="absolute inset-0 rounded-full bg-brand-primary animate-ping opacity-25"></div>
          </div>
          <span className="font-display font-bold text-xl md:text-2xl tracking-tight text-ink-primary italic group-hover:text-brand-primary transition-colors">
            Praxis
          </span>
        </div>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-brand-primary text-white shadow-sm' 
                    : 'text-ink-secondary hover:text-brand-primary hover:bg-brand-light/50'
                }`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Auth & CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {!isAuthority && (
                <button
                  onClick={openReportModal}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-dark text-white rounded-full text-sm font-semibold shadow-md hover:scale-102 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  Report Issue
                </button>
              )}
              
              <div className="flex items-center gap-2 pl-2 border-l border-ink-primary/10">
                <img 
                  src={getAvatarSvg(profile?.displayName || user.displayName || 'Citizen', profile?.email || user.email)} 
                  alt="Avatar" 
                  className={`w-8 h-8 rounded-full border-2 ${isAuthority ? 'border-status-critical' : 'border-brand-primary'} cursor-pointer`}
                  onClick={() => setCurrentTab('profile')}
                  title="View Profile"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-ink-primary leading-tight max-w-[100px] truncate">
                    {profile?.displayName || user.displayName || 'Citizen'}
                  </span>
                  {isAuthority ? (
                    <span className="text-[9px] text-status-critical font-mono font-black leading-none bg-status-critical-bg px-1.5 py-0.5 rounded border border-status-critical/10 mt-0.5">
                      OFFICIAL
                    </span>
                  ) : (
                    <span className="text-[10px] text-brand-primary font-mono font-bold leading-none mt-0.5">
                      Lvl {profile?.level || 1} • {profile?.xp || 10} XP
                    </span>
                  )}
                </div>
                <button 
                  onClick={logout}
                  className="p-1 text-ink-muted hover:text-status-critical rounded-full hover:bg-bg-sunken transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setCurrentTab('auth')}
              className="flex items-center gap-2 px-5 py-2 bg-brand-primary hover:bg-brand-dark text-white rounded-full text-sm font-semibold shadow-md transition-all duration-300 cursor-pointer"
            >
              Sign In / Register
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user && !isAuthority && (
            <button
              onClick={openReportModal}
              className="flex items-center justify-center w-8 h-8 bg-brand-primary text-white rounded-full shadow-sm"
            >
              <Plus size={16} />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-ink-secondary hover:text-brand-primary rounded-md border border-ink-primary/10 bg-bg-surface"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-3 bg-bg-elevated border border-ink-primary/10 rounded-xl flex flex-col gap-2.5 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                  isActive 
                    ? 'bg-brand-primary text-white' 
                    : 'text-ink-secondary hover:bg-bg-sunken'
                }`}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
          
          <div className="h-[1px] bg-ink-primary/10 my-1"></div>
          
          {user ? (
            <div className="flex items-center justify-between p-1">
              <div className="flex items-center gap-2.5" onClick={() => { setCurrentTab('profile'); setMobileMenuOpen(false); }}>
                <img 
                  src={getAvatarSvg(profile?.displayName || user.displayName || 'Citizen', profile?.email || user.email)} 
                  alt="Avatar" 
                  className={`w-9 h-9 rounded-full border-2 ${isAuthority ? 'border-status-critical' : 'border-brand-primary'}`}
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-ink-primary">
                    {profile?.displayName || user.displayName || 'Citizen'}
                  </span>
                  {isAuthority ? (
                    <span className="text-[9px] text-status-critical font-mono font-black leading-none bg-status-critical-bg px-1.5 py-0.5 rounded border border-status-critical/10 mt-0.5">
                      OFFICIAL
                    </span>
                  ) : (
                    <span className="text-xs text-brand-primary font-mono font-bold">
                      Lvl {profile?.level || 1} • {profile?.xp || 10} XP
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-status-critical/30 text-status-critical hover:bg-status-critical-bg rounded-lg text-xs font-semibold transition-all"
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setCurrentTab('auth'); setMobileMenuOpen(false); }}
              className="w-full text-center py-2.5 bg-brand-primary text-white rounded-lg text-sm font-bold shadow-sm"
            >
              Sign In / Register
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
