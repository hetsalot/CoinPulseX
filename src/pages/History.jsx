import React, { useState, useEffect } from "react";
import TradeHistory from "../components/TradeHistory";
import { getAuth } from "firebase/auth";

const History = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-semibold">Checking user...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950">
        <p className="text-lg">Please log in to view your trade history.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 px-6 md:px-12 pb-8">
      <h1 className="text-3xl md:text-4xl font-semibold mb-8 text-gray-100">
        Trade History
      </h1>
      <TradeHistory userId={userId} />
    </div>
  );
};

export default History;
