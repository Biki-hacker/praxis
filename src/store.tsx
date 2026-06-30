import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirebase } from './firebase';
import { 
  onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User
} from 'firebase/auth';
import { googleProvider } from './firebase';
import { Issue, UserProfile } from './types';

interface AppContextType {
  user: User | null;
  profile: UserProfile | null;
  authLoading: boolean;
  issues: Issue[];
  issuesLoading: boolean;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;
  isDemoAccount: boolean;
  login: () => Promise<void>;
  signInWithEmail: (email: string, pass: string, role: 'citizen' | 'authority') => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role: 'citizen' | 'authority') => Promise<{ needsConfirmation: boolean }>;
  signInWithGoogle: (role: 'citizen' | 'authority') => Promise<void>;
  logout: () => Promise<void>;
  refreshIssues: () => Promise<void>;
  addComment: (issueId: string, text: string) => Promise<void>;
  verifyIssue: (issueId: string, note?: string, mediaUrl?: string) => Promise<void>;
  updateIssueStatus: (issueId: string, status: Issue['status'], note?: string, resolvedMediaUrl?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const isDemoAccount = !!user && (
    localStorage.getItem('praxis_is_demo') === 'true' ||
    user.email === 'citizen.demo@praxis.org' ||
    user.email === 'official@praxis.org'
  );

  // Sync user profile from Express backend
  const syncUserWithBackend = async (currentUser: User, requestedRole: 'citizen' | 'authority' = 'citizen') => {
    try {
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          requestedRole,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync with server');
      }
    } catch (err: any) {
      console.error('Error syncing user with backend:', err);
      throw err;
    }
  };

  // Auth listener
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    
    // Check if there is a persistent mock user in localStorage
    const savedMockUser = localStorage.getItem('praxis_mock_user');
    if (savedMockUser) {
      try {
        const parsedUser = JSON.parse(savedMockUser);
        setUser(parsedUser);
        syncUserWithBackend(parsedUser, parsedUser.role || 'citizen')
          .then(() => {
            setAuthLoading(false);
          })
          .catch((err) => {
            console.warn('Initial mock sync failed:', err);
            setAuthLoading(false);
          });
        return;
      } catch (err) {
        localStorage.removeItem('praxis_mock_user');
      }
    }

    // Check if we have a Supabase session
    const authProvider = localStorage.getItem('praxis_auth_provider');
    if (authProvider === 'supabase') {
      import('./supabase').then(({ getSupabase }) => {
        try {
          const supabase = getSupabase();
          supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
              const mappedUser = {
                uid: session.user.id,
                displayName: session.user.user_metadata?.displayName || session.user.user_metadata?.name || session.user.email?.split('@')[0],
                email: session.user.email,
                photoURL: session.user.user_metadata?.photoURL || session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
                emailVerified: !!session.user.email_confirmed_at,
              } as any;
              setUser(mappedUser);
              try {
                await syncUserWithBackend(mappedUser, 'citizen');
              } catch (err) {
                console.warn('Initial Supabase session sync failed:', err);
                await supabase.auth.signOut();
                setUser(null);
                setProfile(null);
                localStorage.removeItem('praxis_auth_provider');
              }
            } else {
              setUser(null);
              setProfile(null);
              localStorage.removeItem('praxis_auth_provider');
            }
            setAuthLoading(false);
          }).catch((err) => {
            console.error('Failed to get Supabase session:', err);
            setAuthLoading(false);
          });

          // Subscribe to Supabase auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
              setUser(null);
              setProfile(null);
              localStorage.removeItem('praxis_auth_provider');
            }
          });

          unsubscribe = () => {
            subscription.unsubscribe();
          };
        } catch (supabaseErr) {
          console.error('Supabase initialization failed:', supabaseErr);
          localStorage.removeItem('praxis_auth_provider');
          setAuthLoading(false);
        }
      }).catch((err) => {
        console.error('Failed to import Supabase:', err);
        localStorage.removeItem('praxis_auth_provider');
        setAuthLoading(false);
      });
      return;
    }

    getFirebase().then(({ auth }) => {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (localStorage.getItem('praxis_mock_user')) {
          return; // Stay logged in as mock user
        }
        setUser(currentUser);
        if (currentUser) {
          try {
            // Default on startup just reads user, doesn't try to register as citizen unless profile doesn't exist
            await syncUserWithBackend(currentUser, 'citizen');
          } catch (err) {
            console.warn('Initial session sync failed, signing out:', err);
            await fbSignOut(auth);
            setUser(null);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        setAuthLoading(false);
      });
    }).catch(err => {
      console.error('Firebase Auth error on boot:', err);
      setAuthLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Fetch issues with resilient retry and exponential backoff
  const refreshIssues = async (retries = 4, delay = 800) => {
    setIssuesLoading(true);
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch('/api/issues');
        if (response.ok) {
          const data = await response.json();
          setIssues(data);
          setIssuesLoading(false);
          return;
        }
        throw new Error(`Server returned status ${response.status}`);
      } catch (err) {
        console.warn(`Attempt ${attempt} to refresh issues failed:`, err);
        if (attempt < retries) {
          await new Promise(res => setTimeout(res, delay * attempt));
        } else {
          console.error('Failed to fetch issues after all attempts:', err);
        }
      }
    }
    setIssuesLoading(false);
  };

  useEffect(() => {
    refreshIssues();
  }, []);

  const login = async () => {
    try {
      const { auth } = await getFirebase();
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserWithBackend(result.user, 'citizen');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (role: 'citizen' | 'authority') => {
    try {
      localStorage.removeItem('praxis_auth_provider'); // Ensure Supabase provider is cleared
      const { auth } = await getFirebase();
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        try {
          await syncUserWithBackend(result.user, role);
        } catch (syncErr: any) {
          // If role sync fails (e.g. they select Official but aren't pre-approved), sign them out!
          await fbSignOut(auth);
          setUser(null);
          setProfile(null);
          throw syncErr;
        }
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string, role: 'citizen' | 'authority') => {
    try {
      // Clean credentials first
      const cleanEmail = email.toLowerCase().trim();
      
      // Fallback for Demo Account
      if (localStorage.getItem('praxis_is_demo') === 'true' || cleanEmail === 'citizen.demo@praxis.org' || cleanEmail === 'official@praxis.org') {
        console.warn('Fallback to secure local mock auth session.');
        const deterministicUid = 'mock_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
        
        const mockUser = {
          uid: deterministicUid,
          displayName: cleanEmail.split('@')[0],
          email: cleanEmail,
          photoURL: role === 'authority' 
            ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
          emailVerified: true,
          isAnonymous: false,
          role
        } as any;
        
        localStorage.setItem('praxis_mock_user', JSON.stringify(mockUser));
        setUser(mockUser);
        await syncUserWithBackend(mockUser, role);
        return;
      }

      const { getSupabase } = await import('./supabase');
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) throw error;

      if (data.user) {
        localStorage.setItem('praxis_auth_provider', 'supabase');
        const mappedUser = {
          uid: data.user.id,
          displayName: data.user.user_metadata?.displayName || data.user.user_metadata?.name || data.user.email?.split('@')[0],
          email: data.user.email,
          photoURL: data.user.user_metadata?.photoURL || data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
          emailVerified: !!data.user.email_confirmed_at,
        } as any;

        setUser(mappedUser);
        try {
          await syncUserWithBackend(mappedUser, role);
        } catch (syncErr: any) {
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          localStorage.removeItem('praxis_auth_provider');
          throw syncErr;
        }
      }
    } catch (error: any) {
      console.error('Email Sign-In Error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, role: 'citizen' | 'authority') => {
    try {
      const cleanEmail = email.toLowerCase().trim();
      
      // Fallback for Demo Account
      if (localStorage.getItem('praxis_is_demo') === 'true') {
        console.warn('Fallback to secure local mock auth signup.');
        const deterministicUid = 'mock_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
        
        const mockUser = {
          uid: deterministicUid,
          displayName: name,
          email: cleanEmail,
          photoURL: role === 'authority' 
            ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
          emailVerified: true,
          isAnonymous: false,
          role
        } as any;
        
        localStorage.setItem('praxis_mock_user', JSON.stringify(mockUser));
        setUser(mockUser);
        await syncUserWithBackend(mockUser, role);
        return { needsConfirmation: false };
      }

      const { getSupabase } = await import('./supabase');
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            displayName: name,
            name: name,
          }
        }
      });

      if (error) throw error;

      // If session is null, it means email confirmation is required by the Supabase project configuration
      const needsConfirmation = data.user && !data.session;

      if (needsConfirmation) {
        return { needsConfirmation: true };
      }

      if (data.user) {
        localStorage.setItem('praxis_auth_provider', 'supabase');
        const mappedUser = {
          uid: data.user.id,
          displayName: name,
          email: data.user.email,
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
          emailVerified: !!data.user.email_confirmed_at,
        } as any;

        setUser(mappedUser);
        try {
          await syncUserWithBackend(mappedUser, role);
        } catch (syncErr: any) {
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          localStorage.removeItem('praxis_auth_provider');
          throw syncErr;
        }
      }
      return { needsConfirmation: false };
    } catch (error: any) {
      console.error('Email Sign-Up Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('praxis_mock_user');
      localStorage.removeItem('praxis_is_demo');
      const authProvider = localStorage.getItem('praxis_auth_provider');
      if (authProvider === 'supabase') {
        const { getSupabase } = await import('./supabase');
        await getSupabase().auth.signOut();
      }
      localStorage.removeItem('praxis_auth_provider');
      
      const { auth } = await getFirebase();
      await fbSignOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addComment = async (issueId: string, text: string) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/issues/${issueId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userName: user.displayName || 'Anonymous Citizen',
          userPhoto: user.photoURL || '',
          text
        }),
      });
      if (response.ok) {
        await refreshIssues();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const verifyIssue = async (issueId: string, note?: string, mediaUrl?: string) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/issues/${issueId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userName: user.displayName || 'Verified Citizen',
          note,
          mediaUrl
        }),
      });
      if (response.ok) {
        await refreshIssues();
        // Refresh profile to reflect newly awarded XP
        if (user) await syncUserWithBackend(user);
      }
    } catch (error) {
      console.error('Error verifying issue:', error);
    }
  };

  const updateIssueStatus = async (issueId: string, status: Issue['status'], note?: string, resolvedMediaUrl?: string) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          note,
          userId: user.uid,
          userName: user.displayName || 'Municipal Authority',
          resolvedMediaUrl
        }),
      });
      if (response.ok) {
        await refreshIssues();
        if (user) await syncUserWithBackend(user);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        authLoading,
        issues,
        issuesLoading,
        isDemoModalOpen,
        setIsDemoModalOpen,
        isDemoAccount,
        login,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        refreshIssues,
        addComment,
        verifyIssue,
        updateIssueStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
