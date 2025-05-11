import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { getUserPortfolio } from "../config/tradeService";
import { getBinancePrice } from "../config/binance";

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [valueData, setValueData] = useState({});
  const [previousData, setPreviousData] = useState({});
  const [loading, setLoading] = useState(true);

  const formatNumber = (num) => {
    const parsedNum = parseFloat(num);
    if (isNaN(parsedNum)) {
      return num;
    }
    return parsedNum < 1 ? parsedNum.toFixed(5) : parsedNum.toFixed(2);
  };

  useEffect(() => {
    let intervalId;

    const fetchData = async (user) => {
      const data = await getUserPortfolio(user.uid);
      setPortfolio(data);

      const holdings = data.holdings || {};
      const symbols = Object.keys(holdings);

      const prices = {};
      for (const coin of symbols) {
        try {
          const priceInfo = await getBinancePrice(`${coin.toUpperCase()}USDT`);
          if (priceInfo) prices[coin] = priceInfo;
        } catch (err) {
          console.warn(`Failed to fetch price for ${coin}:`, err);
        }
      }

      setPreviousData(valueData);
      setValueData(prices);
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      fetchData(user);
      intervalId = setInterval(() => fetchData(user), 10000);
    });

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [valueData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-semibold">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  const totalValue = formatNumber(
    (
      portfolio.balance +
      Object.entries(portfolio.holdings || {}).reduce((acc, [coin, amount]) => {
        const coinData = valueData[coin];
        return acc + (coinData?.price || 0) * amount;
      }, 0)
    ).toFixed(2)
  );

  return (
    <div className="pt-24 px-4 sm:px-10 text-white bg-gray-950 min-h-screen py-8">
      <div className="flex flex-col items-start mb-6">
        <h1 className="text-2xl sm:text-4xl font-semibold text-center  text-gray-100">
          Portfolio
        </h1>

        <div className="text-left mt-4 sm:mt-6">
          <p className="text-lg sm:text-xl font-semibold">
            CCoins Balance: ${formatNumber(portfolio?.balance)}
          </p>
          <p className="text-lg sm:text-xl text-cyan-300 font-semibold">
            Total Valuation: ${totalValue}
          </p>
        </div>
      </div>

      {Object.keys(portfolio.holdings || {}).length === 0 ? (
        <p className="text-gray-400">No crypto holdings yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(portfolio.holdings).map(([coin, amount]) => {
            const coinData = valueData[coin];
            const prevPrice = previousData[coin]?.price || 0;
            const currentPrice = coinData?.price || 0;
            const total = currentPrice * amount;

            const priceDiff = currentPrice - prevPrice;
            const Arrow = priceDiff >= 0 ? "🔺" : "🔻";

            return (
              <div
                key={coin}
                className="bg-gray-900 p-4 rounded-xl shadow-md flex flex-row justify-between space-y-4"
              >
                <div>
                  <h3
                    className={`text-lg sm:text-xl font-semibold ${
                      priceDiff >= 0 ? "text-green-300" : "text-red-400"
                    }`}
                  >
                    {coin.toUpperCase()}
                  </h3>
                  <p className="text-sm sm:text-base">
                    <span className="font-semibold text-white">Amount</span>:{" "}
                    {formatNumber(amount)}
                  </p>
                  <p className="text-sm sm:text-base">
                    <span className="font-semibold text-white">
                      Current Price:
                    </span>{" "}
                    ${formatNumber(currentPrice)}
                  </p>
                  <p className="text-sm sm:text-base">
                    <span className="font-semibold text-white">
                      Total Value:
                    </span>{" "}
                    ${formatNumber(total)}
                  </p>
                </div>

                <div
                  className={`text-2xl sm:text-3xl flex items-center justify-center ${
                    priceDiff >= 0
                      ? "text-green-400 animate-pulse"
                      : priceDiff < 0
                      ? "text-red-500 animate-pulse"
                      : "text-gray-400"
                  }`}
                >
                  {Arrow}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
