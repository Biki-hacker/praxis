import React from 'react';
import { useAppStore } from '../store';
import { Globe3D } from '../components/Globe3D';
import { ArrowRight, Camera, Cpu, Users, Shield } from 'lucide-react';

interface LandingProps {
  setCurrentTab: (tab: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ setCurrentTab }) => {
  const { user, issues } = useAppStore();

  const liveStats = [
    { label: 'Issues Reported', value: '1,247' },
    { label: 'Resolution Rate', value: '89%' },
    { label: 'Citizens Active', value: '4,301' },
    { label: 'Cities Empowered', value: '12' },
  ];

  const steps = [
    {
      step: '01',
      title: 'Snap & Report',
      desc: 'Upload a picture of the problem. Our app captures geolocation data instantly.',
      icon: Camera,
      color: 'bg-status-open-bg text-status-open',
    },
    {
      step: '02',
      title: 'AI Validates',
      desc: 'Gemini AI analyzes the image, automatically tags the category, and assesses the risk severity.',
      icon: Cpu,
      color: 'bg-brand-light text-brand-primary',
    },
    {
      step: '03',
      title: 'City Resolves',
      desc: 'Local community upvotes, tracks live updates, and municipal authorities mark it resolved.',
      icon: Users,
      color: 'bg-status-resolved-bg text-status-resolved',
    },
  ];

  const defaultIssues = [
    { id: 'def-1', title: 'Water leakage near main crossing', status: 'open' },
    { id: 'def-2', title: 'Streetlight broken in Lane 3', status: 'in_progress' },
    { id: 'def-3', title: 'Garbage pile-up at park entrance', status: 'resolved' },
    { id: 'def-4', title: 'Open manhole risk on main avenue', status: 'open' },
    { id: 'def-5', title: 'Pavement damaged near market area', status: 'resolved' }
  ];
  const tickerIssues = issues && issues.length > 0 ? issues.slice(0, 5) : defaultIssues;

  return (
    <div className="w-full flex flex-col min-h-screen overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative max-w-7xl mx-auto w-full px-4 pt-8 md:pt-16 pb-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 flex flex-col text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-light text-brand-primary text-xs font-bold rounded-full w-fit mb-6">
            <Shield size={13} />
            Hyperlocal • AI-Powered • Civic Trust
          </div>

          <h1 className="font-display font-black text-5xl md:text-7xl leading-tight text-ink-primary tracking-tight mb-6">
            Your city. <br />
            <span className="text-brand-primary italic font-display font-medium">Reported.</span> <br />
            Resolved.
          </h1>

          <p className="text-base md:text-lg text-ink-secondary max-w-xl font-light leading-relaxed mb-8">
            Praxis turns citizen voices into infrastructure action. Powered by AI, realtime maps, and local community trust.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center">
            {user ? (
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-brand-dark text-white rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-102"
              >
                Open Map Dashboard
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('auth')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-brand-dark text-white rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-102"
              >
                Get Started
                <ArrowRight size={16} />
              </button>
            )}

            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 border border-ink-primary/10 hover:border-ink-primary/30 text-ink-secondary bg-white hover:bg-bg-sunken rounded-full font-semibold text-sm transition-all cursor-pointer"
            >
              Explore Live Map
            </button>
          </div>
        </div>

        {/* Hero 3D Globe Render */}
        <div className="md:col-span-5 w-full flex items-center justify-center">
          <div className="relative w-full max-w-[420px] aspect-square rounded-full bg-white/20 shadow-xl border border-white/40 overflow-hidden flex items-center justify-center">
            <Globe3D />
            <div className="absolute bottom-4 bg-white/90 backdrop-blur-sm border border-ink-primary/5 px-3 py-1.5 rounded-full shadow-sm text-[10px] font-mono text-brand-primary font-bold animate-pulse">
              ● ROTATE GLOBE TO EXPLORE PINS
            </div>
          </div>
        </div>
      </section>

      {/* 2. Counter Stats Bar */}
      <section className="bg-bg-sunken border-y border-ink-primary/8 py-8 px-4 w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {liveStats.map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="font-display font-black text-3xl md:text-4xl text-brand-primary leading-none mb-1">
                {stat.value}
              </span>
              <span className="text-xs font-semibold text-ink-secondary">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Infinite Marquee Ticker */}
      <div className="relative bg-brand-primary text-black py-3.5 overflow-hidden w-full select-none flex">
        <div className="flex animate-marquee whitespace-nowrap gap-12 shrink-0">
          <div className="flex gap-12 shrink-0 items-center">
            {tickerIssues.map((issue, idx) => (
              <span key={`a-${issue.id}-${idx}`} className="flex items-center gap-2 font-mono text-xs font-semibold text-black">
                <b className="text-[#F27D26]">●</b> {issue.title} ({issue.status.replace('_', ' ').toUpperCase()})
              </span>
            ))}
          </div>
          <div className="flex gap-12 shrink-0 items-center">
            {tickerIssues.map((issue, idx) => (
              <span key={`b-${issue.id}-${idx}`} className="flex items-center gap-2 font-mono text-xs font-semibold text-black">
                <b className="text-[#F27D26]">●</b> {issue.title} ({issue.status.replace('_', ' ').toUpperCase()})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-left w-full">
        <div className="max-w-xl mb-12">
          <h2 className="font-display font-black text-3xl md:text-5xl text-ink-primary leading-tight mb-4">
            From frustration to fixed, in three simple steps.
          </h2>
          <p className="text-ink-secondary font-light">
            No complex municipal phone queues. No red tape. Praxis automates validation to make issue fixing transparent and gamified.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={idx} 
                className="bg-bg-surface border border-ink-primary/5 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 font-display font-black text-5xl text-ink-primary/5">
                  {s.step}
                </div>
                <div className={`p-3.5 rounded-xl w-fit mb-5 ${s.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-display font-bold text-xl text-ink-primary mb-2.5">
                  {s.title}
                </h3>
                <p className="text-sm text-ink-secondary font-light leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CTA banner */}
      <section className="max-w-7xl mx-auto px-4 pb-16 w-full">
        <div className="bg-brand-light border border-brand-primary/10 text-white rounded-3xl px-6 py-12 md:p-16 text-center relative overflow-hidden shadow-xl">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-brand-dark/10 rounded-full blur-2xl"></div>

          <div className="max-w-2xl mx-auto relative z-10 flex flex-col items-center">
            <h2 className="font-display font-black text-3xl md:text-5xl text-ink-primary leading-tight mb-4">
              Be the change your neighborhood needs.
            </h2>
            <p className="text-ink-secondary font-light text-sm md:text-base mb-8">
              Every pothole cased, streetlight reported, and leakage flagged contributes XP towards your civic profile. Join thousands of citizens reporting today.
            </p>

            {user ? (
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="px-8 py-3.5 bg-brand-primary hover:bg-brand-dark text-black rounded-full font-bold text-sm shadow-md transition-all cursor-pointer scale-102 hover:scale-105"
              >
                Get Started Now
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('auth')}
                className="px-8 py-3.5 bg-brand-primary hover:bg-brand-dark text-black rounded-full font-bold text-sm shadow-md transition-all cursor-pointer scale-102 hover:scale-105"
              >
                Sign Up Now — It's Free
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-sunken border-t border-ink-primary/5 py-8 text-center px-4 w-full mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display font-bold text-lg italic text-ink-primary">
            Praxis
          </span>
          <span className="text-xs text-ink-muted">
            © {new Date().getFullYear()} Praxis project. Powered by Gemini & Firebase.
          </span>
        </div>
      </footer>
    </div>
  );
};
