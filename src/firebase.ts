import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

let initPromise: Promise<{ auth: Auth; db: Firestore }> | null = null;

export function getFirebase(): Promise<{ auth: Auth; db: Firestore }> {
  if (app && auth && db) {
    return Promise.resolve({ auth, db });
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    let lastError: any = null;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        // Fetch configuration from our server endpoint
        const response = await fetch('/api/firebase-config');
        if (!response.ok) {
          throw new Error(`Failed to load Firebase configuration from server: ${response.status}`);
        }
        const config = await response.json();
        
        const apps = getApps();
        if (apps.length === 0) {
          app = initializeApp(config);
        } else {
          app = apps[0];
        }
        
        auth = getAuth(app);
        db = getFirestore(app, config.firestoreDatabaseId || "ai-studio-e5c2e71b-72ff-4d6b-a791-35cdbcdc7193");
        
        return { auth, db };
      } catch (error) {
        lastError = error;
        console.warn(`Firebase initialization attempt ${attempt} failed:`, error);
        if (attempt < 4) {
          // Wait longer with each retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 800 * attempt));
        }
      }
    }
    console.error('Firebase initialization failed after all attempts:', lastError);
    throw lastError;
  })();

  return initPromise;
}

// Helper to get Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
