import React, { useEffect, useState } from "react";

const COINS = {
  BTC: "BTCUSDT", // Bitcoin
  ETH: "ETHUSDT", // Ethereum
  SOL: "SOLUSDT", // Solana
  ADA: "ADAUSDT", // Cardano
  XRP: "XRPUSDT", // XRP (Ripple)
  LTC: "LTCUSDT", // Litecoin
  BNB: "BNBUSDT", // Binance Coin
  DOGE: "DOGEUSDT", // Dogecoin
  DOT: "DOTUSDT", // Polkadot
  AVAX: "AVAXUSDT", // Avalanche
  UNI: "UNIUSDT", // Uniswap
  LINK: "LINKUSDT", // Chainlink
  BCH: "BCHUSDT", // Bitcoin Cash
  ALGO: "ALGOUSDT", // Algorand
};

const CryptoPriceCard = ({ onCoinChange, onPriceUpdate }) => {
  const [selected, setSelected] = useState("BTC");
  const [data, setData] = useState(null);

  const format = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num < 1 ? num.toFixed(5) : num.toFixed(2);
  };

  const fetchStats = async (symbol) => {
    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${COINS[symbol]}`
      );
      const json = await res.json();
      const price = format(json.lastPrice);
      const volume = format(json.volume);
      const marketCap = format(
        parseFloat(json.lastPrice) * parseFloat(json.volume)
      );
      const high24h = format(json.highPrice);
      const low24h = format(json.lowPrice);
      const priceChange = parseFloat(json.priceChangePercent).toFixed(2);

      const stats = { price, volume, marketCap, high24h, low24h, priceChange };
      setData(stats);

      if (onPriceUpdate) onPriceUpdate(price);
    } catch (err) {
      console.error("Error fetching Binance stats:", err);
    }
  };

  useEffect(() => {
    fetchStats(selected);
    const interval = setInterval(() => fetchStats(selected), 5000);
    return () => clearInterval(interval);
  }, [selected]);

  const handleCoinChange = (e) => {
    const newCoin = e.target.value;
    setSelected(newCoin);
    if (onCoinChange) onCoinChange(newCoin);
  };

  useEffect(() => {
    if (onCoinChange) onCoinChange(selected);
  }, []);

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Crypto Stats</h2>
        <select
          value={selected}
          onChange={handleCoinChange}
          className="bg-gray-700 text-white p-2 rounded-md border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          {Object.keys(COINS).map((coin) => (
            <option key={coin} value={coin} className="text-black">
              {coin}
            </option>
          ))}
        </select>
      </div>

      {data ? (
        <div className="space-y-2 text-lg text-gray-300 overflow-hidden">
          <p className="flex justify-between text-sm md:text-base">
            <span className="font-semibold">Price:</span>{" "}
            <span>${data.price}</span>
          </p>
          <p className="flex justify-between text-sm md:text-base">
            <span className="font-semibold">24h Volume:</span>{" "}
            <span>{data.volume}</span>
          </p>
          <p className="flex justify-between text-sm md:text-base">
            <span className="font-semibold">Market Cap:</span>{" "}
            <span>${data.marketCap}</span>
          </p>
          <p className="flex justify-between text-sm md:text-base">
            <span className="font-semibold">24h High:</span>{" "}
            <span>${data.high24h}</span>
          </p>
          <p className="flex justify-between text-sm md:text-base">
            <span className="font-semibold">24h Low:</span>{" "}
            <span>${data.low24h}</span>
          </p>
          <p className="flex justify-between text-sm md:text-base">
            <span className="font-semibold">Price Change (24h):</span>{" "}
            <span
              className={
                data.priceChange >= 0 ? "text-green-500" : "text-red-500"
              }
            >
              {data.priceChange}%
            </span>
          </p>
        </div>
      ) : (
        <p className="text-center text-gray-400">Loading data...</p>
      )}
    </div>
  );
};

export default CryptoPriceCard;
