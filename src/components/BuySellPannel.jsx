import React, { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const Pannel = ({ userId, selectedCoin, currentPrice }) => {
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState("buy");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [tradePreview, setTradePreview] = useState(null);

  // Helper function to format numbers
  const formatNumber = (num) => {
    const parsedNum = parseFloat(num);
    if (isNaN(parsedNum)) {
      return num;
    }
    return parsedNum < 1 ? parsedNum.toFixed(5) : parsedNum.toFixed(2);
  };

  // Calculate trade preview whenever amount changes
  useEffect(() => {
    if (amount && !isNaN(amount) && currentPrice) {
      const value = parseFloat(amount) * parseFloat(currentPrice);
      setTradePreview({
        amount: formatNumber(amount),
        value: formatNumber(value),
        price: formatNumber(currentPrice),
      });
    } else {
      setTradePreview(null);
    }
  }, [amount, currentPrice, action]);

  const handleTrade = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const coinId = selectedCoin.toUpperCase();

    try {
      //Validatee inputs
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Get the user document
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User not found");
      }

      const userData = userSnap.data();
      const parsedAmount = parseFloat(amount);
      const parsedPrice = parseFloat(currentPrice);
      const value = parsedAmount * parsedPrice;

      // Ensure data structure exists
      const holdings = userData.holdings || {};
      let currentBalance = userData.balance || 0;

      // Create trade data
      const tradeData = {
        type: action,
        coin: coinId,
        amount: parsedAmount,
        price: parsedPrice,
        totalValue: value,
        timestamp: new Date(),
        previousBalance: currentBalance,
      };

      if (action === "buy") {
        // Check if user has enough balance
        if (value > currentBalance) {
          throw new Error(
            `Insufficient balance. You need ${value.toFixed(
              2
            )} but have ${currentBalance.toFixed(2)}`
          );
        }

        // Update holdings and balance
        holdings[coinId] = (holdings[coinId] || 0) + parsedAmount;
        currentBalance = currentBalance - value;
        tradeData.newBalance = currentBalance;
      } else {
        // Check if user has enough of the coin
        const currentHolding = holdings[coinId] || 0;

        if (currentHolding < parsedAmount) {
          throw new Error(
            `Insufficient ${coinId} holdings. You have ${currentHolding} but trying to sell ${parsedAmount}`
          );
        }

        // Update holdings and balance
        holdings[coinId] = parseFloat(
          (currentHolding - parsedAmount).toFixed(8)
        );

        // Remove the coin from holdings if amount becomes 0
        if (holdings[coinId] === 0) {
          delete holdings[coinId];
        }

        currentBalance = currentBalance + value;
        tradeData.newBalance = currentBalance;
      }

      // First add the trade to the subcollection
      const tradesRef = collection(db, "users", userId, "trades");
      const newTradeRef = await addDoc(tradesRef, tradeData);

      // Then update the user document with new balance and holdings
      await updateDoc(userRef, {
        balance: parseFloat(currentBalance.toFixed(2)),
        holdings: holdings,
        lastUpdated: new Date(),
      });

      // Clear form and show success message
      setAmount("");
      setSuccess(
        `Successfully ${
          action === "buy" ? "bought" : "sold"
        } ${parsedAmount} ${coinId} for ${value.toFixed(
          2
        )}. New balance: ${currentBalance.toFixed(2)}`
      );
    } catch (err) {
      console.error("Trade error:", err);
      setError(err.message || "Something went wrong with your trade");
    }

    setLoading(false);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white w-full ">
      <h2 className="text-xl font-semibold mb-6">Trade {selectedCoin}</h2>

      <div className="mb-4">
        <input
          type="number"
          step="any"
          placeholder="Amount of coins"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 bg-gray-800 rounded focus:outline-none focus:ring focus:ring-cyan-500"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setAction("buy")}
          className={`flex-1 py-2 rounded cursor-pointer hover:animate-pulse ${
            action === "buy"
              ? "bg-cyan-400 text-black"
              : "bg-gray-800 text-white"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setAction("sell")}
          className={`flex-1 py-2 rounded cursor-pointer hover:animate-pulse  ${
            action === "sell"
              ? "bg-cyan-400 text-black"
              : "bg-gray-800 text-white"
          }`}
        >
          Sell
        </button>
      </div>

      {tradePreview && (
        <div className="mb-4 p-2 bg-gray-800 rounded">
          <div className="flex justify-between">
            <span>Price:</span>
            <span>${formatNumber(currentPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Value:</span>
            <span>${formatNumber(tradePreview.value)}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleTrade}
        disabled={loading || !amount}
        className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded transition disabled:opacity-50 hover:animate-pulse cursor-pointer"
      >
        {loading
          ? "Processing..."
          : `${action === "buy" ? "Buy" : "Sell"} ${selectedCoin}`}
      </button>

      {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}

      {success && <p className="text-green-400 mt-2 text-sm">{success}</p>}
    </div>
  );
};

export default Pannel;
