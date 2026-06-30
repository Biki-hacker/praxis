import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart2, TrendingUp, Cpu, Sparkles, AlertTriangle, ShieldCheck, Clock, Loader2 } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { issues } = useAppStore();
  const [stats, setStats] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictionsLoading, setPredictionsLoading] = useState(false);

  const getAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/summary');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const getPredictions = async () => {
    setPredictionsLoading(true);
    try {
      const res = await fetch('/api/gemini/predict-hotspots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: 22.5726,
          lng: 88.4336,
          radiusKm: 2,
          recentIssues: issues.slice(0, 8)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPredictions(data);
      }
    } catch (err) {
      console.error('Error fetching predictive hotspots:', err);
    } finally {
      setPredictionsLoading(false);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await getAnalytics();
      await getPredictions();
      setLoading(false);
    };
    loadAll();
  }, [issues]);

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  // Formatting categories for Recharts Pie Donut
  const colorsList = ['#F5C518', '#3AABDB', '#F59E0B', '#65A30D', '#8B5CF6', '#6B7280'];
  const donutData = Object.keys(stats.byCategory || {}).map((catName, idx) => ({
    name: catName,
    value: stats.byCategory[catName] || 0,
    color: colorsList[idx % colorsList.length]
  })).filter(item => item.value > 0);

  // Resolution Trend Chart Data
  const trendData = [
    { day: 'Mon', reported: 8, resolved: 5 },
    { day: 'Tue', reported: 12, resolved: 8 },
    { day: 'Wed', reported: 15, resolved: 11 },
    { day: 'Thu', reported: 9, resolved: 13 },
    { day: 'Fri', reported: 14, resolved: 10 },
    { day: 'Sat', reported: 7, resolved: 9 },
    { day: 'Sun', reported: 5, resolved: 7 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-left animate-fadeIn">
      
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl md:text-5xl text-ink-primary leading-none mb-2">
          Community Impact
        </h1>
        <p className="text-sm text-ink-secondary font-light">
          Real-time civic statistics tracking structural resolution rates and AI hazard predictions.
        </p>
      </div>

      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-surface border border-ink-primary/5 p-5 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Total Reported</span>
          <span className="font-display font-black text-3xl text-ink-primary leading-none block mb-1.5">{stats.totalIssues}</span>
          <span className="text-[10px] text-brand-primary font-bold">↑ +12% this week</span>
        </div>

        <div className="bg-bg-surface border border-ink-primary/5 p-5 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Resolution Rate</span>
          <span className="font-display font-black text-3xl text-status-resolved leading-none block mb-1.5">{stats.resolutionRate}%</span>
          <span className="text-[10px] text-status-resolved font-bold">↑ +5.4% improvement</span>
        </div>

        <div className="bg-bg-surface border border-ink-primary/5 p-5 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Average Fixing Speed</span>
          <span className="font-display font-black text-3xl text-brand-primary leading-none block mb-1.5">{stats.avgResolutionDays} days</span>
          <span className="text-[10px] text-brand-primary font-bold">↓ -0.6d faster response</span>
        </div>

        <div className="bg-bg-surface border border-ink-primary/5 p-5 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Active Citizens</span>
          <span className="font-display font-black text-3xl text-status-open leading-none block mb-1.5">301+</span>
          <span className="text-[10px] text-status-open font-bold">★ Active auditing group</span>
        </div>
      </div>

      {/* CHARTS GRAPHICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Trend Area Chart (8/12) */}
        <div className="lg:col-span-8 bg-bg-surface border border-ink-primary/5 rounded-2xl p-6 shadow-sm">
          <h3 className="font-display font-bold text-base text-ink-primary mb-5 flex items-center gap-1.5">
            <TrendingUp size={16} className="text-brand-primary" />
            Weekly Outage & Resolution Trend
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
                <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#1A1A1A', color: '#E0E0E0' }} />
                <Area type="monotone" dataKey="reported" stroke="#FFFFFF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReported)" name="Reported" />
                <Area type="monotone" dataKey="resolved" stroke="#4CAF50" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution Donut (4/12) */}
        <div className="lg:col-span-4 bg-bg-surface border border-ink-primary/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-ink-primary mb-4">
              Category Distribution
            </h3>
            <div className="w-full h-48 flex items-center justify-center">
              {donutData.length === 0 ? (
                <span className="text-xs text-ink-muted">No category data.</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-3 border-t border-ink-primary/4">
            {donutData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-ink-secondary">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono font-bold text-ink-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* GEMINI AI PREDICTIVE HOTSPOTS METRIC */}
      <div className="bg-bg-surface border border-brand-primary/10 rounded-2xl p-6 shadow-sm flex flex-col gap-5 text-left">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-ink-primary/5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-light text-brand-primary rounded-xl">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-ink-primary flex items-center gap-1">
                🔮 Gemini Spatial Predictor
              </h3>
              <p className="text-[11px] text-ink-muted">Predictive neural spatial analysis using live local hazard histories</p>
            </div>
          </div>

          <div className="text-[10px] bg-brand-light font-mono font-bold text-brand-primary px-3 py-1 rounded-full border border-brand-primary/10">
            MODEL: GEMINI-2.0-FLASH
          </div>
        </div>

        {predictionsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="animate-spin text-brand-primary" size={24} />
            <span className="text-xs font-bold text-brand-primary font-mono animate-pulse uppercase">AI is analyzing density layout maps...</span>
          </div>
        ) : (
          <>
            {predictions.some(p => p.isQuotaFallback) && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-left">
                <div className="p-1.5 bg-amber-500 text-white rounded-lg h-fit shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-amber-500 uppercase font-mono leading-none mb-1">Local Spatial Predictor Active</span>
                  <span className="text-xs text-ink-primary font-light leading-relaxed">
                    Gemini API quota is currently exceeded. Real-time predictive calculations have transitioned to localized topological fallback templates to preserve service availability.
                  </span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {predictions.map((p, idx) => {
                const riskColor = p.riskLevel === 'High' ? 'text-status-critical bg-status-critical-bg' : 'text-status-open bg-status-open-bg';
                return (
                  <div key={idx} className="border border-ink-primary/5 bg-bg-sunken/20 hover:bg-bg-surface p-4 rounded-xl flex flex-col justify-between transition-all">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-brand-primary bg-brand-light border border-brand-primary/10 px-2 py-0.5 rounded-full">
                          {p.predictedType} Outbreak
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${riskColor}`}>
                          {p.riskLevel} Risk
                        </span>
                      </div>

                      <p className="text-xs text-ink-primary leading-relaxed font-light mb-4">
                        "{p.reason}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-ink-primary/4 pt-3 text-[10px] font-mono text-ink-muted">
                      <span className="font-bold flex items-center gap-0.5">
                        <Sparkles size={11} className="text-brand-primary" />
                        Confidence: {Math.round((p.confidence || 0.8) * 100)}%
                      </span>
                      <span>
                        Loc: {p.lat?.toFixed(3)}, {p.lng?.toFixed(3)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

    </div>
  );
};
