// ProfilePage.jsx
import React, { useState, useEffect } from "react";
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  // Initialize auth and provider
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        // Don't automatically create user document - might cause permission issues
        // Instead, check if user exists first
        checkUserDocument(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  // Check if user document exists and fetch balance
  const checkUserDocument = async (user) => {
    if (!user) return;

    try {
      const db = getFirestore();
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setBalance(userData.balance || 0);
      } else {
      }
    } catch (error) {}
  };

  // Handle Google Sign-In
  const handleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      try {
        const db = getFirestore();
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
          await setDoc(userDocRef, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            balance: 1000,
            createdAt: new Date(),
          });
          setBalance(1000);
        } else {
          const userData = docSnap.data();
          setBalance(userData.balance || 0);
        }
      } catch (error) {
        console.error("Error with user document:", error);
      }
    } catch (error) {
      console.error("Sign-in error: ", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign-Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setBalance(0);
    } catch (error) {
      console.error("Sign-out error:", error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center pt-24 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white">
          Welcome to CoinPulseX
        </h2>

        {!user ? (
          <div className="text-center space-y-4">
            <p className="text-base sm:text-lg ">
              Sign in with Google to access your account.
            </p>
            <button
              onClick={handleSignIn}
              className="w-full bg-cyan-500 text-black hover:bg-cyan-600 py-2 rounded-md transition duration-300 hover:animate-pulse cursor-pointer"
            >
              Sign In with Google
            </button>
          </div>
        ) : (
          <div className="text-center space-y-6">
            {user.photoURL && (
              <div className="flex justify-center">
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-2 border-cyan-500"
                />
              </div>
            )}
            <h3 className="text-xl sm:text-2xl font-semibold">
              Hello, {user.displayName}!
            </h3>
            <p className="text-base sm:text-lg">
              You are successfully signed in.
            </p>

            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Your Balance:</p>
              <div className="text-xl sm:text-2xl font-bold text-cyan-500">
                ${balance.toLocaleString()}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full bg-red-500 text-black hover:bg-red-600 py-2 rounded-md transition duration-300 hover:animate-pulse cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProfilePage;
