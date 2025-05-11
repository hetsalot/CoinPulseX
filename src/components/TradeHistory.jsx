import React, { useState, useEffect } from "react";
import { getUserTrades } from "../config/tradeService";

const TradeHistory = ({ userId }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrades = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const tradesData = await getUserTrades(userId);
        setTrades(tradesData);
        setError("");
      } catch (err) {
        console.error("Error fetching trade history:", err);
        setError("Failed to load trade history");
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [userId]);

  // Format numbers
  const formatNumber = (num) => {
    const parsedNum = parseFloat(num);
    if (isNaN(parsedNum)) {
      return num;
    }
    return parsedNum < 1 ? parsedNum.toFixed(5) : parsedNum.toFixed(2);
  };

  // format date
  const formatDate = (dateObj) => {
    if (!dateObj) return "N/A";
    return new Date(dateObj).toLocaleString();
  };

  return (
    <div className="bg-gray-900 py-4 px-6 rounded-lg shadow-md text-white w-full">
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-gray-950 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium">Loading your trades...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-4">
          <p>{error}</p>
        </div>
      ) : trades.length === 0 ? (
        <div className="text-center py-4">
          <p>
            No trade history found. Start trading to see your activity here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-2 py-2 text-left">Type</th>
                <th className="px-2 py-2 text-left">Coin</th>
                <th className="px-2 py-2 text-right">Amount</th>
                <th className="px-2 py-2 text-right">Price</th>
                <th className="px-2 py-2 text-right">Total</th>
                <th className="px-2 py-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr
                  key={trade.id}
                  className="border-b border-gray-800 hover:bg-gray-800"
                >
                  <td
                    className={`px-2 py-2 ${
                      trade.type === "buy" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {trade.type === "buy" ? "BUY" : "SELL"}
                  </td>
                  <td className="px-2 py-2">{trade.coin}</td>
                  <td className="px-2 py-2 text-right">
                    {formatNumber(trade.amount)}
                  </td>
                  <td className="px-2 py-2 text-right">
                    ${formatNumber(trade.price)}
                  </td>
                  <td className="px-2 py-2 text-right">
                    ${formatNumber(trade.totalValue)}
                  </td>
                  <td className="px-2 py-2 text-right text-sm">
                    {formatDate(trade.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TradeHistory;
