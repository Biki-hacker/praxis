import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { getIssuePlaceholderSvg } from '../utils/issuePlaceholder';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ThreeOverlay } from '../components/ThreeOverlay';
import { Issue } from '../types';
import { 
  Search, Map, Box, AlertCircle, 
  MapPin, ArrowRight, RefreshCw, Plus, ChevronDown, Check
} from 'lucide-react';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
  setSelectedIssueId: (id: string) => void;
  openReportModal: () => void;
}

// Map center controller to animate map flyTo
const MapCenterController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { animate: true, duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left text-xs bg-bg-surface hover:bg-bg-sunken border border-ink-primary/10 hover:border-ink-primary/20 py-2 px-3 rounded-lg text-ink-secondary focus:border-brand-primary/30 focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all cursor-pointer shadow-sm font-medium flex items-center justify-between"
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown size={12} className={`text-ink-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-bg-surface border border-ink-primary/10 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    isSelected 
                      ? 'bg-brand-primary/5 text-brand-primary font-semibold' 
                      : 'text-ink-secondary hover:bg-bg-sunken hover:text-ink-primary'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={12} className="text-brand-primary shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  setCurrentTab, 
  setSelectedIssueId, 
  openReportModal 
}) => {
  const { issues, issuesLoading, refreshIssues } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Pothole', label: 'Pothole' },
    { value: 'Water', label: 'Water Leak' },
    { value: 'Light', label: 'Streetlight' },
    { value: 'Waste', label: 'Garbage' },
    { value: 'Infrastructure', label: 'Infrastructure' }
  ];

  const severityOptions = [
    { value: 'all', label: 'All Risks' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'Working' },
    { value: 'resolved', label: 'Resolved' }
  ];
  
  // Map View Mode: '2d' or '3d'
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  
  // Map center coordinates. Defaults to Salt Lake Sector V center
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.57264, 88.43363]);
  const [mapZoom, setMapZoom] = useState(15);
  const [activePreviewIssue, setActivePreviewIssue] = useState<Issue | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Pothole': return '#F5C518'; // yellow
      case 'Water': return '#3AABDB'; // sky blue
      case 'Light': return '#F59E0B'; // amber
      case 'Waste': return '#65A30D'; // green
      case 'Infrastructure': return '#8B5CF6'; // purple
      default: return '#6B7280'; // gray
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

  // 1. Filtering logic
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || issue.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || issue.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const handleCardClick = (issue: Issue) => {
    setMapCenter([issue.lat, issue.lng]);
    setMapZoom(17);
    setActivePreviewIssue(issue);
    // On mobile, scroll to map
    if (window.innerWidth < 768) {
      document.getElementById('map-viewport-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Custom DivIcon generator to avoid default Leaflet pin asset loading issues
  const createCustomIcon = (issue: Issue) => {
    const color = getCategoryColor(issue.category);
    const pulseHtml = issue.status === 'open' 
      ? `<div style="position: absolute; top: -5px; left: -5px; width: 22px; height: 22px; border-radius: 50%; background-color: ${color}; animation: markerPulse 2s infinite ease-out; opacity: 0.5;"></div>` 
      : '';
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative; width: 14px; height: 14px; background-color: ${color}; border: 2px solid #050505; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;">
          ${pulseHtml}
        </div>
      `,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  return (
    <div className="w-full flex flex-col md:flex-row h-[calc(100vh-62px)] overflow-hidden">
      
      {/* LEFT SIDEBAR: Filters & Feed */}
      <div className="w-full md:w-[420px] bg-bg-surface border-r border-ink-primary/8 flex flex-col h-full z-10">
        
        {/* Sidebar Header & Search */}
        <div className="p-4 border-b border-ink-primary/5 bg-bg-elevated flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-xl text-ink-primary flex items-center gap-1.5">
              <span>Civic Feed</span>
              <span className="text-xs px-2 py-0.5 bg-brand-light text-brand-primary font-mono font-extrabold rounded-full">
                {filteredIssues.length}
              </span>
            </h2>
            <button 
              onClick={refreshIssues}
              className="p-1.5 hover:bg-bg-sunken rounded-md text-ink-secondary hover:text-brand-primary transition-all"
              title="Refresh issues"
              disabled={issuesLoading}
            >
              <RefreshCw size={15} className={issuesLoading ? 'animate-spin text-brand-primary' : ''} />
            </button>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-ink-muted" />
            <input
              type="text"
              placeholder="Search potholes, waste, lights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-bg-sunken rounded-lg text-sm font-sans text-ink-primary placeholder:text-ink-muted border border-transparent focus:border-brand-primary/20 outline-none transition-all"
            />
          </div>

          {/* Quick Filters Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-ink-muted block mb-1 uppercase tracking-wide">Category</label>
              <CustomSelect 
                value={selectedCategory} 
                onChange={setSelectedCategory} 
                options={categoryOptions} 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-ink-muted block mb-1 uppercase tracking-wide">Severity</label>
              <CustomSelect 
                value={selectedSeverity} 
                onChange={setSelectedSeverity} 
                options={severityOptions} 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-ink-muted block mb-1 uppercase tracking-wide">Status</label>
              <CustomSelect 
                value={selectedStatus} 
                onChange={setSelectedStatus} 
                options={statusOptions} 
              />
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-bg-base/30">
          {filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-ink-muted">
              <AlertCircle size={32} className="mb-2 text-ink-muted" />
              <p className="text-sm font-semibold">No issues found</p>
              <p className="text-xs">Adjust your search or filter keywords.</p>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const borderLeftColor = getCategoryColor(issue.category);
              const isSelected = activePreviewIssue?.id === issue.id;

              return (
                <div
                  key={issue.id}
                  onClick={() => handleCardClick(issue)}
                  className={`bg-bg-surface border ${
                    isSelected ? 'border-brand-primary ring-2 ring-brand-primary/15' : 'border-ink-primary/5 hover:border-ink-primary/15'
                  } rounded-xl shadow-sm p-4 text-left transition-all duration-300 cursor-pointer hover:-translate-y-0.5 flex flex-col relative overflow-hidden`}
                >
                  {/* Category Side Indicator */}
                  <div 
                    className="absolute top-0 left-0 bottom-0 w-1.5" 
                    style={{ backgroundColor: borderLeftColor }}
                  />

                  <div className="pl-2.5 flex flex-col">
                    <div className="flex justify-between items-start gap-1.5 mb-1.5">
                      <span className="font-mono text-[9px] text-ink-muted uppercase font-bold tracking-wider">
                        {issue.category} • {new Date(issue.reportedAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1">
                        {(issue as any).isDemo && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                            Demo
                          </span>
                        )}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold border uppercase ${getSeverityBadge(issue.severity)}`}>
                          {issue.severity}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border uppercase ${getStatusBadge(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-display font-black text-sm text-ink-primary tracking-tight leading-snug line-clamp-2 mb-1.5">
                      {issue.title}
                    </h3>

                    <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed mb-3 font-light">
                      {issue.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-ink-secondary border-t border-ink-primary/4 pt-2.5">
                      <span className="flex items-center gap-0.5 font-sans font-medium text-ink-muted max-w-[200px] truncate">
                        <MapPin size={11} className="shrink-0" />
                        {issue.address}
                      </span>
                      <span className="font-mono font-bold text-brand-primary flex items-center gap-0.5">
                        {issue.upvoteCount || 0} UPVOTES
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Map Container with 2D / 3D views */}
      <div id="map-viewport-section" className="flex-1 relative flex flex-col h-full bg-bg-sunken">
        
        {/* Toggle Mode Control Bar */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm p-1.5 rounded-full border border-ink-primary/8 shadow-md">
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === '2d' 
                ? 'bg-brand-primary text-white shadow-sm' 
                : 'text-ink-secondary hover:text-brand-primary hover:bg-bg-sunken'
            }`}
          >
            <Map size={13} />
            2D Map
          </button>
          <button
            onClick={() => {
              setViewMode('3d');
              setActivePreviewIssue(null);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === '3d' 
                ? 'bg-brand-primary text-white shadow-sm' 
                : 'text-ink-secondary hover:text-brand-primary hover:bg-bg-sunken'
            }`}
          >
            <Box size={13} />
            3D View
          </button>
        </div>

        {viewMode === '3d' ? (
          <div className="w-full h-full p-4 flex flex-col justify-center">
            <ThreeOverlay issues={filteredIssues} />
          </div>
        ) : (
          <div className="w-full h-full relative z-0">
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              {/* CartoDB minimal map style (looks modern & elegant) */}
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              <MapCenterController center={mapCenter} zoom={mapZoom} />

              {filteredIssues.map((issue) => (
                <Marker 
                  key={issue.id} 
                  position={[issue.lat, issue.lng]} 
                  icon={createCustomIcon(issue)}
                  eventHandlers={{
                    click: () => setActivePreviewIssue(issue)
                  }}
                >
                  <Popup>
                    <div className="p-1 max-w-[200px]">
                      <h4 className="font-display font-bold text-xs text-ink-primary leading-tight mb-1">{issue.title}</h4>
                      <p className="text-[10px] text-ink-secondary line-clamp-2 leading-snug mb-1.5">{issue.description}</p>
                      <button 
                        onClick={() => {
                          setSelectedIssueId(issue.id);
                          setCurrentTab('issue-detail');
                        }}
                        className="text-[10px] font-bold text-brand-primary flex items-center gap-0.5 hover:underline"
                      >
                        View Full Report <ArrowRight size={10} />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* BOTTOM SHEET / PREVIEW DRAWER (When a pin or card is selected in 2D mode) */}
        {viewMode === '2d' && activePreviewIssue && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[380px] z-20 bg-white border border-ink-primary/10 rounded-2xl shadow-xl p-4 flex flex-col text-left animate-slideUp">
            <div className="flex justify-between items-start gap-1.5 mb-2">
              <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wide">
                {activePreviewIssue.category} • near salt lake
              </span>
              <button 
                onClick={() => setActivePreviewIssue(null)}
                className="text-ink-muted hover:text-ink-primary text-sm font-semibold p-1 hover:bg-bg-sunken rounded-full leading-none w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <img 
              src={(activePreviewIssue.mediaUrls && activePreviewIssue.mediaUrls[0] && !activePreviewIssue.mediaUrls[0].includes('unsplash.com')) ? activePreviewIssue.mediaUrls[0] : getIssuePlaceholderSvg(activePreviewIssue.category)} 
              alt="Issue Thumb" 
              className="w-full h-32 object-cover rounded-xl mb-3 border border-ink-primary/5"
            />

            <h3 className="font-display font-black text-base text-ink-primary tracking-tight leading-snug mb-1">
              {activePreviewIssue.title}
            </h3>
            
            <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed mb-4">
              {activePreviewIssue.description}
            </p>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-ink-primary/5">
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold border uppercase ${getSeverityBadge(activePreviewIssue.severity)}`}>
                  {activePreviewIssue.severity}
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border uppercase ${getStatusBadge(activePreviewIssue.status)}`}>
                  {activePreviewIssue.status.replace('_', ' ')}
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedIssueId(activePreviewIssue.id);
                  setCurrentTab('issue-detail');
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-brand-primary hover:bg-brand-dark text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Explore Deep-Dive
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Floating action button: Add Report (FAB) */}
        <button
          onClick={openReportModal}
          className="absolute bottom-6 left-6 z-20 flex items-center gap-1.5 px-5 py-3.5 bg-brand-primary hover:bg-brand-dark text-white rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-all cursor-pointer"
        >
          <Plus size={18} />
          Report New Issue
        </button>
      </div>
    </div>
  );
};
