import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut
} from "firebase/auth";
import { auth, provider, db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getLocalPortfolioData, saveLocalPortfolioData } from "../config/tradeService";

const AuthContext = createContext(null);

const DEV_STORAGE_KEY = "coinpulsex_dev_user";

export const isLocalEnvironment = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local") ||
    Boolean(import.meta.env.DEV)
  );
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Auto-redirect 127.0.0.1 to localhost for Firebase Auth compatibility
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.hostname === "127.0.0.1"
    ) {
      const newUrl = window.location.href.replace("127.0.0.1", "localhost");
      window.location.replace(newUrl);
    }
  }, []);

  // Sync user document with Firestore and local storage mirror
  const syncUserDoc = async (firebaseUser) => {
    if (!firebaseUser) return;
    try {
      // Ensure local portfolio storage exists with initial $10,000 balance
      const localData = getLocalPortfolioData(firebaseUser.uid);
      if (!localData || localData.balance === undefined) {
        saveLocalPortfolioData(firebaseUser.uid, {
          balance: 10000,
          holdings: { BTC: 0.15, ETH: 1.5, SOL: 10 }
        });
      }

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          displayName: firebaseUser.displayName || "Trader",
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || "",
          balance: 10000,
          createdAt: new Date(),
        });
      }
    } catch (err) {
      console.warn("Firestore sync notice (local storage fallback active):", err.message);
    }
  };

  useEffect(() => {
    // Check for saved local dev session first if on local
    const savedDevUser = localStorage.getItem(DEV_STORAGE_KEY);
    if (savedDevUser && isLocalEnvironment()) {
      try {
        const parsed = JSON.parse(savedDevUser);
        setUser(parsed);
        setLoading(false);
      } catch {
        localStorage.removeItem(DEV_STORAGE_KEY);
      }
    }

    // Check for pending redirect sign-in results from Google
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          localStorage.removeItem(DEV_STORAGE_KEY);
          setUser(result.user);
          syncUserDoc(result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
        setAuthError(error.message);
      });

    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // If we already have an active dev user session, only override if a real Firebase user logs in
      if (firebaseUser) {
        localStorage.removeItem(DEV_STORAGE_KEY);
        setUser(firebaseUser);
        syncUserDoc(firebaseUser);
      } else {
        const currentDev = localStorage.getItem(DEV_STORAGE_KEY);
        if (currentDev && isLocalEnvironment()) {
          try {
            setUser(JSON.parse(currentDev));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In with Popup and auto-fallback
  const signInWithGoogle = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      localStorage.removeItem(DEV_STORAGE_KEY);
      setUser(result.user);
      await syncUserDoc(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Google popup error:", error);
      let message = error.message;

      if (error.code === "auth/unauthorized-domain") {
        message = `This domain (${window.location.hostname}) is not authorized in your Firebase Console. Ensure you run on http://localhost:5173 or add ${window.location.hostname} to Firebase Authentication > Settings > Authorized domains.`;
      } else if (
        error.code === "auth/popup-blocked" ||
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        message = "Popup was blocked or closed. You can use Redirect Sign-In or Quick Dev Mode below.";
      }

      setAuthError(message);
      return { success: false, error: message, code: error.code };
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In with Redirect (for strict browser security environments)
  const signInWithGoogleRedirect = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      localStorage.removeItem(DEV_STORAGE_KEY);
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Google redirect error:", error);
      setAuthError(error.message);
      setLoading(false);
    }
  };

  // Quick Dev / Test User Login for local environment testing
  const signInAsDevUser = (customDetails = {}) => {
    const devUser = {
      uid: "local-dev-trader-01",
      displayName: customDetails.displayName || "Dev Trader",
      email: customDetails.email || "tester@coinpulsex.local",
      photoURL: customDetails.photoURL || "https://api.dicebear.com/7.x/bottts/svg?seed=CoinPulseX",
      isLocalDev: true,
      balance: customDetails.balance || 10000,
    };

    localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(devUser));
    setUser(devUser);
    setAuthError(null);
    return devUser;
  };

  // Unified Sign Out
  const logout = async () => {
    localStorage.removeItem(DEV_STORAGE_KEY);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn("Sign out warning:", err);
    }
    setUser(null);
    setAuthError(null);
  };

  const isDevMode = Boolean(user?.isLocalDev);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        isDevMode,
        isLocalEnv: isLocalEnvironment(),
        signInWithGoogle,
        signInWithGoogleRedirect,
        signInAsDevUser,
        logout,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
