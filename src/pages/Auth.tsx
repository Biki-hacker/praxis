import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Shield, User, Mail, Lock, Sparkles, Loader2, AlertTriangle, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
  setCurrentTab: (tab: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ setCurrentTab }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAppStore();
  const [role, setRole] = useState<'citizen' | 'authority'>('citizen');
  const [isSignUp, setIsSignUp] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  
  // Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (role === 'citizen') {
        if (isSignUp) {
          if (!name.trim()) throw new Error('Please enter your full name');
          const res = await signUpWithEmail(email, password, name.trim(), 'citizen');
          if (res?.needsConfirmation) {
            setAwaitingConfirmation(true);
            setLoading(false);
            return;
          }
        } else {
          await signInWithEmail(email, password, 'citizen');
        }
      } else {
        // Officials - Sign In only
        await signInWithEmail(email, password, 'authority');
      }
      
      setSuccess(true);
      setTimeout(() => {
        if (role === 'authority') {
          setCurrentTab('dashboard'); // Redirect to dashboard / admin console
        } else {
          setCurrentTab('dashboard');
        }
      }, 1500);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Email not confirmed') || err.message?.includes('Email not verified')) {
        setAwaitingConfirmation(true);
      } else if (err.message?.toLowerCase().includes('rate limit') || err.message?.toLowerCase().includes('rate_limit')) {
        setError('You have requested emails too quickly. Please wait a few minutes before trying to sign up or log in again.');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle(role);
      setSuccess(true);
      setTimeout(() => {
        setCurrentTab('dashboard');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user')) {
        setError(
          "Google Sign-In popup was closed or blocked. If you are using the embedded preview, please open the app in a new tab by clicking the 'Open in New Tab' button in the top right corner of the preview, as browsers restrict popups inside iframes. Also make sure to allow popups in your browser settings."
        );
      } else {
        setError(err.message || 'Google authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoName: string, demoRole: 'citizen' | 'authority') => {
    setError(null);
    setLoading(true);
    try {
      localStorage.setItem('praxis_is_demo', 'true');
      const demoPassword = 'PraxisDemoPassword123!';
      try {
        await signInWithEmail(demoEmail, demoPassword, demoRole);
      } catch (err: any) {
        if (
          err.code === 'auth/user-not-found' || 
          err.code === 'auth/invalid-credential' || 
          err.code === 'auth/wrong-password' ||
          err.message?.includes('user-not-found') || 
          err.message?.includes('invalid-credential') ||
          err.message?.includes('wrong-password') ||
          err.message?.includes('INVALID_LOGIN_CREDENTIALS')
        ) {
          await signUpWithEmail(demoEmail, demoPassword, demoName, demoRole);
        } else {
          throw err;
        }
      }
      setSuccess(true);
      setTimeout(() => {
        setCurrentTab('dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('Quick Demo Login Error:', err);
      setError(err.message || 'Quick Demo Login failed. Please try standard login/signup.');
    } finally {
      localStorage.removeItem('praxis_is_demo');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 py-12 flex flex-col items-center justify-center text-left">
      <div className="w-full bg-bg-surface border border-ink-primary/5 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        
        {/* Abstract background blur */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-status-resolved/5 rounded-full blur-3xl -z-10"></div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-display font-black text-2xl md:text-3xl text-ink-primary tracking-tight mb-2">
            Praxis Civic Portal
          </h2>
          <p className="text-xs text-ink-secondary font-light max-w-xs mx-auto">
            Choose your identity to access direct municipal action or citizen report channels.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-status-resolved/10 text-status-resolved flex items-center justify-center mb-4">
              <CheckCircle size={36} />
            </div>
            <h3 className="font-display font-bold text-lg text-ink-primary mb-1">Access Granted</h3>
            <p className="text-xs text-ink-secondary font-light">
              Welcome back! Syncing profile and routing to active portal...
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-brand-primary font-mono font-bold">
              <span>Entering platform</span>
              <Loader2 size={12} className="animate-spin" />
            </div>
          </div>
        ) : awaitingConfirmation ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
              <Mail size={36} className="animate-bounce" />
            </div>
            <h3 className="font-display font-bold text-lg text-ink-primary mb-2">Check Your Email</h3>
            <p className="text-xs text-ink-secondary font-light max-w-sm mx-auto mb-6 leading-relaxed">
              We have sent a verification link to <strong className="text-ink-primary">{email}</strong>. 
              Please click the link in that email to confirm your account and log in.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setAwaitingConfirmation(false);
                  setIsSignUp(false);
                  setError(null);
                }}
                className="w-full py-3 bg-brand-primary hover:bg-brand-dark rounded-full text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>I have confirmed my email, let's login!</span>
                <ArrowRight size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setAwaitingConfirmation(false);
                  setError(null);
                }}
                className="text-xs text-ink-muted hover:text-ink-primary transition-all font-medium py-1"
              >
                Back to Sign Up
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Dual Role Selector Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Citizen Card */}
              <button
                type="button"
                onClick={() => {
                  setRole('citizen');
                  setError(null);
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all ${
                  role === 'citizen'
                    ? 'border-brand-primary bg-brand-light/20 shadow-md text-brand-primary scale-[1.02]'
                    : 'border-ink-primary/5 bg-bg-sunken/40 hover:bg-bg-sunken text-ink-muted'
                }`}
              >
                <div className={`p-2 rounded-xl ${role === 'citizen' ? 'bg-brand-primary text-white' : 'bg-bg-elevated text-ink-muted'}`}>
                  <User size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold font-display leading-tight">Citizen Portal</span>
                  <span className="text-[9px] font-light leading-tight mt-0.5 opacity-80">Report & track</span>
                </div>
              </button>

              {/* Official Card */}
              <button
                type="button"
                onClick={() => {
                  setRole('authority');
                  setIsSignUp(false); // Official cannot signup
                  setError(null);
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all ${
                  role === 'authority'
                    ? 'border-status-critical bg-status-critical-bg text-status-critical shadow-md scale-[1.02]'
                    : 'border-ink-primary/5 bg-bg-sunken/40 hover:bg-bg-sunken text-ink-muted'
                }`}
              >
                <div className={`p-2 rounded-xl ${role === 'authority' ? 'bg-status-critical text-white' : 'bg-bg-elevated text-ink-muted'}`}>
                  <Shield size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold font-display leading-tight">Officials Portal</span>
                  <span className="text-[9px] font-light leading-tight mt-0.5 opacity-80">Inspect & resolve</span>
                </div>
              </button>
            </div>

            {/* Tab Swapper for Citizens only */}
            {role === 'citizen' ? (
              <div className="flex border-b border-ink-primary/5 mb-6">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 pb-2.5 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors ${
                    !isSignUp ? 'border-brand-primary text-brand-primary' : 'border-transparent text-ink-muted'
                  }`}
                >
                  Citizen Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 pb-2.5 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors ${
                    isSignUp ? 'border-brand-primary text-brand-primary' : 'border-transparent text-ink-muted'
                  }`}
                >
                  Citizen Signup
                </button>
              </div>
            ) : (
              <div className="bg-status-critical-bg/30 border border-status-critical/10 rounded-2xl p-3.5 mb-6 text-left flex gap-2">
                <Shield size={14} className="text-status-critical shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-black text-status-critical uppercase leading-none mb-1">Administrative Login Only</span>
                  <p className="text-[10px] text-ink-secondary leading-relaxed font-light">
                    Officials are registered securely by the municipal Praxis administrative squad. Signup is locked.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-status-critical-bg text-status-critical text-xs p-3.5 rounded-xl border border-status-critical/10 flex gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-bold uppercase font-mono text-[10px] leading-none mb-1">Auth Blocked</span>
                  <p className="font-light leading-normal">{error}</p>
                </div>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              
              {role === 'citizen' && isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-3.5 text-ink-muted" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-3 bg-bg-sunken border border-transparent rounded-xl outline-none focus:border-brand-primary/15 focus:bg-bg-surface transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-3.5 text-ink-muted" />
                  <input
                    type="email"
                    required
                    placeholder={role === 'authority' ? 'official@praxis.org' : 'you@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-3 bg-bg-sunken border border-transparent rounded-xl outline-none focus:border-brand-primary/15 focus:bg-bg-surface transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-3 bg-bg-sunken border border-transparent rounded-xl outline-none focus:border-brand-primary/15 focus:bg-bg-surface transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary transition-colors focus:outline-none flex items-center justify-center"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'authority'
                    ? 'bg-status-critical hover:bg-status-critical/90'
                    : 'bg-brand-primary hover:bg-brand-dark'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>{role === 'authority' ? 'Official Portal Login' : isSignUp ? 'Create Citizen Account' : 'Citizen Portal Login'}</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>

              {/* Separator */}
              <div className="flex items-center my-2 text-[10px] text-ink-muted font-mono uppercase">
                <div className="flex-1 h-[1px] bg-ink-primary/5"></div>
                <span className="px-2">or</span>
                <div className="flex-1 h-[1px] bg-ink-primary/5"></div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3 border border-ink-primary/5 hover:border-ink-primary/10 bg-bg-sunken/30 hover:bg-bg-surface text-ink-primary rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61a5.66 5.66 0 0 1-2.45 3.71v3.08h3.95c2.31-2.13 3.63-5.27 3.63-8.64z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.95-3.08c-1.1.74-2.51 1.18-4.01 1.18-3.09 0-5.71-2.09-6.64-4.9H1.32v3.19A12 12 0 0 0 12 24z"/>
                  <path fill="#FBBC05" d="M5.36 14.29a7.16 7.16 0 0 1 0-4.58V6.52H1.32a12 12 0 0 0 0 10.96l4.04-3.19z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.93 11.93 0 0 0 12 0 12 12 0 0 0 1.32 6.52l4.04 3.19c.93-2.81 3.55-4.96 6.64-4.96z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Separator for Quick Demo */}
              <div className="flex items-center my-3 text-[10px] text-brand-primary font-mono uppercase">
                <div className="flex-1 h-[1px] bg-brand-primary/10"></div>
                <span className="px-2 flex items-center gap-1 font-bold">
                  <Sparkles size={10} className="text-brand-primary animate-pulse" />
                  Quick Demo Access
                </span>
                <div className="flex-1 h-[1px] bg-brand-primary/10"></div>
              </div>

              {/* Quick Demo Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('citizen.demo@praxis.org', 'Citizen', 'citizen')}
                  disabled={loading}
                  className="py-2.5 px-3 border border-brand-primary/20 hover:border-brand-primary/40 bg-brand-light/10 hover:bg-brand-light/20 text-brand-primary rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center"
                >
                  <span className="font-extrabold text-brand-primary leading-none">Citizen Demo</span>
                  <span className="text-[9px] font-light text-ink-secondary leading-none mt-0.5">Citizen</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('official@praxis.org', 'Municipal Inspector', 'authority')}
                  disabled={loading}
                  className="py-2.5 px-3 border border-status-critical/20 hover:border-status-critical/40 bg-status-critical-bg/30 hover:bg-status-critical-bg/50 text-status-critical rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center"
                >
                  <span className="font-extrabold text-status-critical leading-none">Official Demo</span>
                  <span className="text-[9px] font-light text-ink-secondary leading-none mt-0.5">Inspector Console</span>
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
