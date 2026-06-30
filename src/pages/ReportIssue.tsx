import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import confetti from 'canvas-confetti';
import { 
  Camera, CheckCircle, Cpu, Loader2, ArrowRight, ArrowLeft, 
  Sparkles, Check, AlertTriangle, ChevronDown, AlertCircle
} from 'lucide-react';
import { extractPhotoMetadata, getDistanceInMeters } from '../utils/exif';
import { getIssuePlaceholderSvg } from '../utils/issuePlaceholder';

interface ReportIssueProps {
  setCurrentTab: (tab: string) => void;
  closeModal?: () => void;
}

// Sub-component to handle map click events for pinning location
const MapClickHandler: React.FC<{ onLocationSelected: (lat: number, lng: number) => void }> = ({ onLocationSelected }) => {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    }
  });
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
        className="w-full text-left text-sm bg-bg-surface hover:bg-bg-sunken border border-ink-primary/10 hover:border-ink-primary/20 py-2.5 px-3.5 rounded-xl text-ink-primary outline-none focus:border-brand-primary/30 focus:ring-2 focus:ring-brand-primary/10 transition-all cursor-pointer shadow-sm font-medium flex items-center justify-between"
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown size={15} className={`text-ink-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-bg-surface border border-ink-primary/10 rounded-xl shadow-xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
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
                  className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors ${
                    isSelected 
                      ? 'bg-brand-primary/5 text-brand-primary font-semibold' 
                      : 'text-ink-secondary hover:bg-bg-sunken hover:text-ink-primary'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={14} className="text-brand-primary shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Preloaded sample images for easy testing of Gemini Vision API
const SAMPLE_TEST_IMAGES = [
  {
    name: 'Severe Pothole',
    url: getIssuePlaceholderSvg('pothole'),
    promptName: 'pothole'
  },
  {
    name: 'Water pipe leak',
    url: getIssuePlaceholderSvg('water'),
    promptName: 'water_leak'
  },
  {
    name: 'Dumped Garbage Pile',
    url: getIssuePlaceholderSvg('garbage'),
    promptName: 'garbage_dump'
  },
  {
    name: 'Broken Streetlight',
    url: getIssuePlaceholderSvg('light'),
    promptName: ' streetlight'
  }
];

export const ReportIssue: React.FC<ReportIssueProps> = ({ setCurrentTab, closeModal }) => {
  const { user, refreshIssues, isDemoAccount } = useAppStore();
  const [step, setStep] = useState(1);

  // Form states
  const reportCategoryOptions = [
    { value: 'Pothole', label: 'Pothole / Road damage' },
    { value: 'Water', label: 'Water Leak / Overflow' },
    { value: 'Light', label: 'Streetlight Failure' },
    { value: 'Waste', label: 'Garbage / Trash Dump' },
    { value: 'Infrastructure', label: 'Infrastructure Fault' },
    { value: 'Other', label: 'Other Community Issue' }
  ];

  const reportSeverityOptions = [
    { value: 'Low', label: 'Low (Minor annoyance)' },
    { value: 'Medium', label: 'Medium (Affects mobility/pedestrians)' },
    { value: 'High', label: 'High (Dangerous driving risk)' },
    { value: 'Critical', label: 'Critical (Immediate collision / flooding danger)' }
  ];

  const [photoUrl, setPhotoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // Proximity & EXIF states
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [photoLat, setPhotoLat] = useState<number | null>(null);
  const [photoLng, setPhotoLng] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Pothole' | 'Water' | 'Light' | 'Waste' | 'Infrastructure' | 'Other'>('Pothole');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [landmark, setLandmark] = useState('');
  const [aiTags, setAiTags] = useState<string[]>([]);
  
  // Location states (default Salt Lake Sector V)
  const [pinLat, setPinLat] = useState(22.57264);
  const [pinLng, setPinLng] = useState(88.43363);
  const [address, setAddress] = useState('Sector V, Salt Lake City, Kolkata, West Bengal');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proximityError, setProximityError] = useState<string | null>(null);

  // Helper to convert remote image URL to base64 server-side or proxy via client
  const triggerGeminiAnalysis = async (imgUrl: string) => {
    setIsAnalyzing(true);
    setPhotoUrl(imgUrl);
    setAiAnalysisResult(null);

    try {
      // 1. Fetch image and convert to Base64 in client
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64String = (reader.result as string).split(',')[1];
          
          // 2. Call server-side Gemini Analyze API
          const analyzeRes = await fetch('/api/gemini/analyze-media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64String,
              mimeType: blob.type || 'image/jpeg'
            })
          });

          if (analyzeRes.ok) {
            const aiData = await analyzeRes.json();
            setAiAnalysisResult(aiData);
            
            // Auto-populate form based on AI Suggestions
            setTitle(`Reported ${aiData.category || 'Issue'}`);
            setDescription(aiData.description || '');
            setCategory(aiData.category || 'Pothole');
            setSeverity(aiData.severity || 'Medium');
            setAiTags(aiData.tags || []);
            
            // Go to step 2 after short delay for magical visual reveal
            setTimeout(() => {
              setStep(2);
            }, 1500);
          } else {
            throw new Error('Gemini analysis endpoint returned error');
          }
        } catch (innerErr) {
          console.warn('Inner Gemini image analysis error:', innerErr);
          // Fail gracefully: let user input details manually
          setAiAnalysisResult({
            category: 'Pothole',
            severity: 'Medium',
            description: 'Failed to connect to AI server. Please specify details manually.',
            confidence: 0,
            tags: ['manual entry']
          });
          setStep(2);
        } finally {
          setIsAnalyzing(false);
        }
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.warn('Gemini image analysis error:', err);
      // Fail gracefully: let user input details manually
      setAiAnalysisResult({
        category: 'Pothole',
        severity: 'Medium',
        description: 'Failed to connect to AI server. Please specify details manually.',
        confidence: 0,
        tags: ['manual entry']
      });
      setIsAnalyzing(false);
      setStep(2);
    }
  };

  // Drag & drop or local file selection with robust EXIF and Live GPS fallbacks
  const handleLocalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetadataError(null);
    const file = e.target.files?.[0];
    if (file) {
      // Validate that it is an image file to avoid breaking processing
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|heic|heif)$/i.test(file.name);
      if (!isImage) {
        setMetadataError("Error: The selected file is not a supported image. Please select a valid photo (.jpg, .jpeg, .png, .heic, or .heif).");
        return;
      }

      try {
        const metadata = await extractPhotoMetadata(file);
        
        let targetLat = metadata?.latitude;
        let targetLng = metadata?.longitude;

        if (!targetLat || !targetLng) {
          // Fallback sequence: try browser Geolocation API
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000
              });
            });
            targetLat = position.coords.latitude;
            targetLng = position.coords.longitude;
            setMetadataError("Notice: GPS metadata was stripped from the photo (common on mobile browsers for privacy). We've successfully used your device's live GPS location instead! You can refine it on the map in the next step.");
          } catch (geoErr) {
            // Geolocation failed or denied: use default Kolkata center
            targetLat = 22.57264;
            targetLng = 88.43363;
            setMetadataError("Notice: No GPS metadata found in the photo, and device location access was not granted. Don't worry! We've loaded your photo, and you can manually pin the correct location on the map in the next step.");
          }
        }

        // Set photo coordinates & align map
        setPhotoLat(targetLat || 22.57264);
        setPhotoLng(targetLng || 88.43363);
        setPinLat(targetLat || 22.57264);
        setPinLng(targetLng || 88.43363);
        reverseGeocode(targetLat || 22.57264, targetLng || 88.43363);

        const reader = new FileReader();
        reader.onloadend = () => {
          triggerGeminiAnalysis(reader.result as string);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.warn("EXIF extraction error:", err);
        setPhotoLat(22.57264);
        setPhotoLng(88.43363);
        setPinLat(22.57264);
        setPinLng(88.43363);
        reverseGeocode(22.57264, 88.43363);
        setMetadataError("Notice: Failed to read photo metadata. You can manually pin the correct location on the map.");
        
        const reader = new FileReader();
        reader.onloadend = () => {
          triggerGeminiAnalysis(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Reverse geocode via OSM Nominatim API
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            'User-Agent': 'Praxis-Applet-Dilip'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAddress(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      setAddress(`Pinned location at [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setPinLat(lat);
    setPinLng(lng);
    reverseGeocode(lat, lng);

    if (photoLat && photoLng) {
      const dist = getDistanceInMeters(lat, lng, photoLat, photoLng);
      if (dist > 200) {
        setProximityError(`Proximity Check Failed: Your pinned map location is ${Math.round(dist)} meters away from where the photo was taken. Please pin a location within 200 meters of the original photo.`);
      } else {
        setProximityError(null);
      }
    }
  };

  // Submit complete report to Express server
  const handleSubmitReport = async () => {
    if (photoLat && photoLng) {
      const dist = getDistanceInMeters(pinLat, pinLng, photoLat, photoLng);
      if (dist > 200) {
        setProximityError(`Proximity Check Failed: Your pinned map location is ${Math.round(dist)} meters away from where the photo was taken. Please select a spot within 200 meters.`);
        return;
      }
    }
    setProximityError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          severity,
          lat: pinLat,
          lng: pinLng,
          address,
          landmark,
          mediaUrls: photoUrl ? [photoUrl] : [],
          reportedBy: user?.uid || 'anonymous',
          reportedByName: user?.displayName || 'Anonymous Citizen',
          reportedByPhoto: user?.photoURL || '',
          aiCategoryConfidence: aiAnalysisResult?.confidence || 0.9,
          aiTags: aiTags,
          aiDescription: aiAnalysisResult?.description || '',
          isDemo: isDemoAccount
        })
      });

      if (response.ok) {
        // Trigger celebration confetti
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });

        await refreshIssues();
        
        // Go to success screen or back to dashboard
        setStep(4);
      }
    } catch (err) {
      console.error('Error submitting report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createCustomIcon = () => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative; width: 14px; height: 14px; background-color: #FFFFFF; border: 2px solid #050505; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.6);">
          <div style="position: absolute; top: -5px; left: -5px; width: 22px; height: 22px; border-radius: 50%; background-color: #FFFFFF; animation: markerPulse 1.5s infinite ease-out; opacity: 0.4;"></div>
        </div>
      `,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-left">
      
      {/* Dynamic wizard steps indicator */}
      <div className="flex items-center justify-between mb-8 max-w-lg mx-auto w-full">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-mono font-bold text-xs transition-all ${
              step === s 
                ? 'bg-brand-primary text-white shadow-md ring-4 ring-brand-primary/10' 
                : step > s 
                  ? 'bg-status-resolved text-white' 
                  : 'bg-bg-sunken text-ink-muted'
            }`}>
              {step > s ? <Check size={14} /> : `0${s}`}
            </div>
            {s < 3 && (
              <div className={`flex-grow h-[2px] mx-4 transition-all duration-300 ${
                step > s ? 'bg-status-resolved' : 'bg-bg-sunken'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1: Image / Photo Upload */}
      {step === 1 && (
        <div className="bg-bg-surface border border-ink-primary/5 rounded-2xl shadow-md p-6 flex flex-col gap-6 animate-fadeIn">
          <div className="text-center">
            <h2 className="font-display font-black text-2xl text-ink-primary tracking-tight mb-2">Show us the problem</h2>
            <p className="text-sm text-ink-secondary">Upload a photo or choose a sample test image below. Civic AI will auto-categorize.</p>
          </div>

          {metadataError && (
            <div className={`${
              metadataError.startsWith('Notice:') 
                ? 'bg-brand-light border-brand-primary/15' 
                : 'bg-status-critical-bg border-status-critical/15'
            } border rounded-xl p-4 flex gap-3 text-left animate-fadeIn`}>
              <div className={`p-1.5 ${
                metadataError.startsWith('Notice:') 
                  ? 'bg-brand-primary' 
                  : 'bg-status-critical'
              } text-white rounded-lg h-fit shrink-0`}>
                <AlertCircle size={16} />
              </div>
              <div className="flex flex-col gap-1">
                <span className={`text-xs font-bold ${
                  metadataError.startsWith('Notice:') 
                    ? 'text-brand-primary' 
                    : 'text-status-critical'
                } uppercase font-mono leading-none`}>
                  {metadataError.startsWith('Notice:') ? 'Location Sourced' : 'GPS Location Required'}
                </span>
                <p className="text-xs text-ink-primary font-light leading-relaxed">
                  {metadataError}
                </p>
              </div>
            </div>
          )}

          {isAnalyzing ? (
            <div className="border-2 border-dashed border-brand-primary/30 rounded-xl p-12 bg-brand-light/20 flex flex-col items-center justify-center gap-4 min-h-[220px]">
              <Loader2 className="animate-spin text-brand-primary" size={36} />
              <div className="flex flex-col items-center">
                <span className="font-display font-bold text-sm text-ink-primary animate-pulse">Praxis AI is scanning photo...</span>
                <span className="text-[11px] text-brand-primary font-mono font-bold uppercase mt-1">running Gemini Vision analyzer</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* File Uploader widget */}
              <label className="border-2 border-dashed border-ink-primary/10 hover:border-brand-primary/40 rounded-xl p-8 bg-bg-sunken/40 flex flex-col items-center justify-center gap-3 min-h-[200px] cursor-pointer hover:bg-brand-light/10 transition-all">
                <input 
                  type="file" 
                  accept="*/*" 
                  onChange={handleLocalFileSelect}
                  className="hidden" 
                />
                <div className="p-3.5 bg-brand-light text-brand-primary rounded-full">
                  <Camera size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-ink-primary">Click to upload original photo</p>
                  <p className="text-[11px] text-brand-primary font-semibold mt-1">Preserves GPS & EXIF Metadata</p>
                  <p className="text-[10px] text-ink-muted mt-0.5">Supports uncompressed JPG, PNG, HEIC</p>
                </div>
              </label>
 
              {/* Sample testing cards */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-ink-muted block uppercase tracking-wide text-left">Or tap a pre-loaded photo to test AI:</span>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_TEST_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setMetadataError(null);
                        setPhotoLat(22.57264);
                        setPhotoLng(88.43363);
                        setPinLat(22.57264);
                        setPinLng(88.43363);
                        triggerGeminiAnalysis(img.url);
                      }}
                      className="group border border-ink-primary/5 rounded-xl overflow-hidden hover:border-brand-primary text-left bg-bg-sunken/20 hover:bg-bg-surface transition-all flex flex-col cursor-pointer"
                    >
                      <img src={img.url} alt={img.name} className="w-full h-20 object-cover group-hover:scale-102 transition-transform" />
                      <div className="p-2 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-ink-primary truncate leading-none">{img.name}</span>
                        <Sparkles size={11} className="text-brand-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          <div className="flex justify-between items-center border-t border-ink-primary/5 pt-4">
            <button 
              onClick={() => closeModal ? closeModal() : setCurrentTab('dashboard')}
              className="text-xs font-bold text-ink-muted hover:text-ink-primary"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 bg-bg-sunken hover:bg-bg-sunken/80 text-ink-secondary rounded-lg text-xs font-bold transition-all"
            >
              Skip Photo
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Detail inputs (prefilled with Gemini analysis output if any) */}
      {step === 2 && (
        <div className="bg-bg-surface border border-ink-primary/5 rounded-2xl shadow-md p-6 flex flex-col gap-6 animate-fadeIn">
          
          <div className="flex items-center gap-2 pb-3 border-b border-ink-primary/5 justify-between">
            <h2 className="font-display font-black text-xl text-ink-primary">Refine Issue Details</h2>
            {aiAnalysisResult && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-status-resolved bg-status-resolved-bg px-2.5 py-1 rounded-full border border-status-resolved/10">
                <Sparkles size={12} />
                Gemini Vision Prefilled
              </div>
            )}
          </div>

          {/* AI Suggestion Alert panel */}
          {aiAnalysisResult && (
            aiAnalysisResult.isQuotaFallback ? (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-left">
                <div className="p-1.5 bg-amber-500 text-white rounded-lg h-fit shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-amber-500 uppercase font-mono leading-none mb-1">Local Template Activated</span>
                  <span className="text-xs text-ink-primary font-light leading-relaxed">
                    The Gemini API is currently experiencing rate limits. We have automatically pre-filled a local template so you can submit your issue without interruption. Feel free to refine any details below!
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-brand-light/30 border border-brand-primary/10 rounded-xl p-4 flex gap-3 text-left">
                <div className="p-1.5 bg-brand-primary text-white rounded-lg h-fit shrink-0">
                  <Cpu size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-brand-primary uppercase font-mono leading-none mb-1">AI Classification Assessment</span>
                  <span className="text-xs text-ink-primary font-light">
                    Gemini classified this as a <span className="font-semibold text-brand-primary">{aiAnalysisResult.category}</span> with <span className="font-bold">{Math.round((aiAnalysisResult.confidence || 0.9) * 100)}% confidence</span>, rating severity <span className="font-semibold text-status-open">{aiAnalysisResult.severity}</span>.
                  </span>
                </div>
              </div>
            )
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-ink-secondary block mb-1">Issue Title *</label>
              <input
                type="text"
                placeholder="Briefly describe what is broken (e.g., Deep water hole at SDF cross)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bg-sunken border border-transparent rounded-lg text-sm text-ink-primary outline-none focus:border-brand-primary/10 font-sans"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-ink-secondary block mb-1.5">Infrastructure Category *</label>
                <CustomSelect
                  value={category}
                  onChange={(val) => setCategory(val as any)}
                  options={reportCategoryOptions}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink-secondary block mb-1.5">Severity Risk *</label>
                <CustomSelect
                  value={severity}
                  onChange={(val) => setSeverity(val as any)}
                  options={reportSeverityOptions}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink-secondary block mb-1">Description / Notes *</label>
              <textarea
                placeholder="Explain the damage size, when it started, and specific safety hazards..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 bg-bg-sunken border border-transparent rounded-lg text-sm text-ink-primary outline-none focus:border-brand-primary/10 font-sans"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink-secondary block mb-1">Nearby Landmark (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Opposite ICICI Bank main gate"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bg-sunken border border-transparent rounded-lg text-sm text-ink-primary outline-none focus:border-brand-primary/10 font-sans"
              />
            </div>
            
            {aiTags.length > 0 && (
              <div>
                <label className="text-[11px] font-bold text-ink-muted block uppercase mb-1">AI Recommended Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {aiTags.map((t, idx) => (
                    <span key={idx} className="text-[10px] bg-bg-sunken px-2 py-0.5 rounded-full text-ink-secondary font-mono font-bold">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center border-t border-ink-primary/5 pt-4 mt-2">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-xs font-bold text-ink-muted hover:text-ink-primary"
            >
              <ArrowLeft size={13} />
              Back
            </button>
            <button
              onClick={() => {
                if (title && description) {
                  setStep(3);
                }
              }}
              disabled={!title || !description}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-primary hover:bg-brand-dark disabled:bg-ink-disabled disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Continue to Location
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Location Pin on Leaflet */}
      {step === 3 && (
        <div className="bg-bg-surface border border-ink-primary/5 rounded-2xl shadow-md p-6 flex flex-col gap-5 animate-fadeIn">
          
          <div>
            <h2 className="font-display font-black text-xl text-ink-primary mb-1">Where is the issue?</h2>
            <p className="text-xs text-ink-secondary">Click/tap on the map to pin the exact coordinates of the issue.</p>
          </div>

          {/* Mini Leaflet Picker Map */}
          <div className="w-full h-64 rounded-xl border border-ink-primary/10 overflow-hidden relative">
            <MapContainer
              center={[pinLat, pinLng]}
              zoom={15}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <MapClickHandler onLocationSelected={handleLocationSelect} />
              <Marker position={[pinLat, pinLng]} icon={createCustomIcon()} />
            </MapContainer>
            
            {isGeocoding && (
              <div className="absolute top-3 left-3 bg-white/95 px-3 py-1.5 rounded-lg border border-brand-primary/10 text-[10px] font-bold text-brand-primary flex items-center gap-1 z-[1000] shadow-sm animate-pulse">
                <Loader2 className="animate-spin" size={10} />
                Resolving address...
              </div>
            )}
          </div>

          {proximityError && (
            <div className="bg-status-critical-bg border border-status-critical/15 rounded-xl p-4 flex gap-3 text-left animate-fadeIn">
              <div className="p-1.5 bg-status-critical text-white rounded-lg h-fit shrink-0">
                <AlertCircle size={16} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-status-critical uppercase font-mono leading-none">Proximity Check Blocked</span>
                <p className="text-xs text-ink-primary font-light leading-relaxed">
                  {proximityError}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1 text-left bg-bg-sunken p-3.5 rounded-xl border border-ink-primary/5">
            <span className="text-[10px] font-mono font-black text-ink-muted uppercase">Selected Street Address</span>
            <span className="text-xs text-ink-primary leading-relaxed font-sans">{address}</span>
            <div className="flex gap-2.5 mt-2 text-[10px] text-brand-primary font-mono font-bold">
              <span>LAT: {pinLat.toFixed(5)}</span>
              <span>LNG: {pinLng.toFixed(5)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-ink-primary/5 pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 text-xs font-bold text-ink-muted hover:text-ink-primary"
            >
              <ArrowLeft size={13} />
              Back
            </button>
            <button
              onClick={handleSubmitReport}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-3 bg-status-resolved hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Publishing Report...
                </>
              ) : (
                <>
                  <Check size={13} />
                  Submit Civic Report (+50 XP)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Success confirmation screen */}
      {step === 4 && (
        <div className="bg-bg-surface border border-ink-primary/5 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center text-center gap-6 animate-fadeIn">
          <div className="w-16 h-16 bg-status-resolved-bg text-status-resolved rounded-full flex items-center justify-center border border-status-resolved/10 animate-bounce">
            <CheckCircle size={36} />
          </div>

          <div className="flex flex-col items-center">
            <h2 className="font-display font-black text-2xl text-ink-primary tracking-tight mb-2">Report Submitted Successfully!</h2>
            <p className="text-sm text-ink-secondary max-w-sm">
              Your civic intelligence report has been published onto Bidhannagar Praxis. Local citizens can now upvote and verify.
            </p>
          </div>

          {/* XP Reward card widget */}
          <div className="bg-brand-light/40 border border-brand-primary/10 rounded-2xl p-4 flex flex-col items-center max-w-xs w-full">
            <span className="text-[10px] font-mono font-black text-brand-primary uppercase tracking-wider mb-1">XP Reward Gained</span>
            <span className="font-display font-black text-3xl text-brand-primary leading-none">+50 XP</span>
            <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wide mt-1.5">★ First Milestone Active ★</span>
          </div>

          <button
            onClick={() => {
              if (closeModal) {
                closeModal();
              } else {
                setCurrentTab('dashboard');
              }
            }}
            className="px-6 py-3 bg-brand-primary hover:bg-brand-dark text-white rounded-xl text-xs font-bold shadow-md hover:scale-102 transition-all cursor-pointer"
          >
            Return to Map Dashboard
          </button>
        </div>
      )}

    </div>
  );
};
