import React, { useState, useEffect, Suspense } from "react";
import CryptoPriceCard from "../components/CryptoPriceCard";
import UserBalance from "../components/UserBalance";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

const BuySellPannel = React.lazy(() => import("../components/BuySellPannel"));
const CryptoChart = React.lazy(() => import("../components/CryptoChart"));

const Dashboard = () => {
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [currentPrice, setCurrentPrice] = useState(null);
  const [userId, setUserId] = useState(null);
  const [balanceKey, setBalanceKey] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsubscribe();
  }, []);

  const handleCoinChange = (coin) => setSelectedCoin(coin);
  const handlePriceUpdate = (price) => setCurrentPrice(price);

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 px-6 md:px-12 pb-8">
      <span className="flex items-center justify-between  flex-row">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8 text-gray-100">
          Crypto Dashboard
        </h1>
        <div className="text-gray-400 mt-1 text-lg md:text-xl">
          <span className="font-medium text-white">
            <UserBalance refreshTrigger={balanceKey} /> {" CCoins"}
          </span>
        </div>
      </span>

      <div className="flex flex-col md:flex-row gap-8 justify-between">
        <div className="w-full md:w-1/3 space-y-6">
          <CryptoPriceCard
            onCoinChange={handleCoinChange}
            onPriceUpdate={handlePriceUpdate}
          />
          <Suspense fallback={<div>Loading panel...</div>}>
            {!(userId && selectedCoin && currentPrice) ? (
              <div className="bg-gray-800 p-6 rounded-lg shadow-md animate-pulse space-y-4">
                <div className="h-5 bg-gray-700 rounded w-1/2"></div>
                <div className="h-10 bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-700 rounded"></div>
                <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto"></div>
              </div>
            ) : (
              <BuySellPannel
                userId={userId}
                selectedCoin={selectedCoin}
                currentPrice={currentPrice}
                onTradeSuccess={() => setBalanceKey((k) => k + 1)}
              />
            )}
          </Suspense>
        </div>

        <div className="w-full md:w-2/3 mt-8 md:mt-0">
          <Suspense fallback={<div>Loading chart...</div>}>
            <CryptoChart coinSymbol={selectedCoin + "USDT"} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
