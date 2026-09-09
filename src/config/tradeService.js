// src/services/tradeService.js

import { 
    doc, 
    collection, 
    getDocs, 
    getDoc, 
    query, 
    where, 
    orderBy, 
    addDoc,
    updateDoc,
    serverTimestamp 
  } from "firebase/firestore";
  import { db } from "./firebase";
  
  // Local storage keys for offline / dev mode
  const getLocalUserKey = (userId) => `coinpulsex_user_${userId}`;
  const getLocalTradesKey = (userId) => `coinpulsex_trades_${userId}`;

  // Check if running in local environment
  export const isLocalEnvironment = () => {
    if (typeof window === "undefined") return false;
    const hostname = window.location.hostname;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".local") ||
      Boolean(import.meta.env?.DEV)
    );
  };

  const isDevUser = (userId) => {
    if (!userId) return false;
    return typeof userId === "string" && userId.startsWith("local-dev");
  };

  // Local storage data accessors
  export const getLocalPortfolioData = (userId) => {
    try {
      const raw = localStorage.getItem(getLocalUserKey(userId));
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Failed reading local user data:", e);
    }
    // Default starting portfolio for trading simulation
    const defaultData = {
      balance: 10000,
      holdings: {
        BTC: 0.15,
        ETH: 1.5,
        SOL: 10
      }
    };
    saveLocalPortfolioData(userId, defaultData);
    return defaultData;
  };

  export const saveLocalPortfolioData = (userId, data) => {
    try {
      localStorage.setItem(getLocalUserKey(userId), JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("coinpulsex_balance_updated", { detail: { ...data, userId } }));
    } catch (e) {
      console.warn("Failed saving local user data:", e);
    }
  };

  export const getLocalTradesList = (userId) => {
    try {
      const raw = localStorage.getItem(getLocalTradesKey(userId));
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.map((t) => ({
          ...t,
          timestamp: t.timestamp ? new Date(t.timestamp) : new Date()
        }));
      }
    } catch (e) {
      console.warn("Failed reading local trades:", e);
    }
    return [];
  };

  export const addLocalTradeRecord = (userId, tradeData) => {
    const list = getLocalTradesList(userId);
    const newRecord = {
      id: `trade_${Date.now()}`,
      ...tradeData,
      timestamp: new Date()
    };
    list.unshift(newRecord);
    try {
      localStorage.setItem(getLocalTradesKey(userId), JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("coinpulsex_trades_updated", { detail: { userId, trades: list } }));
    } catch (e) {
      console.warn("Failed saving local trade:", e);
    }
    return newRecord;
  };

  /**
   * Get all trades for a specific user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of trade objects
   */
  export const getUserTrades = async (userId) => {
    if (!userId) return [];

    if (isDevUser(userId)) {
      return getLocalTradesList(userId);
    }

    try {
      const tradesRef = collection(db, "users", userId, "trades");
      const q = query(tradesRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      
      const firestoreTrades = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date()
      }));

      // If Firestore returned trades, return them; otherwise fallback to any local trades
      if (firestoreTrades.length > 0) return firestoreTrades;
      return getLocalTradesList(userId);
    } catch (error) {
      console.warn("Firestore error in getUserTrades, using local fallback:", error.message);
      return getLocalTradesList(userId);
    }
  };
  
  /**
   * Get trades for a specific coin
   * @param {string} userId - The user ID
   * @param {string} coinId - The coin ID
   * @returns {Promise<Array>} - Array of trade objects for that coin
   */
  export const getCoinTrades = async (userId, coinId) => {
    if (!userId) return [];

    if (isDevUser(userId)) {
      return getLocalTradesList(userId).filter(
        (t) => t.coin?.toUpperCase() === coinId.toUpperCase()
      );
    }

    try {
      const tradesRef = collection(db, "users", userId, "trades");
      const q = query(
        tradesRef, 
        where("coin", "==", coinId.toUpperCase()),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date()
      }));
    } catch (error) {
      console.warn(`Firestore error in getCoinTrades for ${coinId}, using local fallback:`, error.message);
      return getLocalTradesList(userId).filter(
        (t) => t.coin?.toUpperCase() === coinId.toUpperCase()
      );
    }
  };
  
  /**
   * Execute a trade locally in memory / localStorage
   */
  const executeLocalTrade = (userId, coinId, parsedAmount, parsedPrice, value, action) => {
    const userData = getLocalPortfolioData(userId);
    const holdings = { ...(userData.holdings || {}) };
    let currentBalance = userData.balance ?? 10000;

    if (action === "buy") {
      if (value > currentBalance) {
        throw new Error(`Insufficient balance. You need $${value.toFixed(2)} but have $${currentBalance.toFixed(2)}`);
      }
      holdings[coinId] = (holdings[coinId] || 0) + parsedAmount;
      currentBalance = currentBalance - value;
    } else {
      const currentHolding = holdings[coinId] || 0;
      if (currentHolding < parsedAmount) {
        throw new Error(`Insufficient ${coinId} holdings. You have ${currentHolding} but trying to sell ${parsedAmount}`);
      }
      holdings[coinId] = parseFloat((currentHolding - parsedAmount).toFixed(8));
      if (holdings[coinId] <= 0) {
        delete holdings[coinId];
      }
      currentBalance = currentBalance + value;
    }

    const newUserData = {
      balance: parseFloat(currentBalance.toFixed(2)),
      holdings
    };
    saveLocalPortfolioData(userId, newUserData);

    const tradeData = {
      type: action,
      coin: coinId.toUpperCase(),
      amount: parsedAmount,
      price: parsedPrice,
      totalValue: value,
      previousBalance: userData.balance,
      newBalance: currentBalance
    };
    const record = addLocalTradeRecord(userId, tradeData);

    return {
      success: true,
      tradeId: record.id,
      newBalance: currentBalance,
      message: `Successfully ${action === "buy" ? "bought" : "sold"} ${parsedAmount} ${coinId}`
    };
  };

  /**
   * Execute a trade (buy or sell)
   * @param {string} userId - The user ID
   * @param {string} coinId - The coin ID
   * @param {number} amount - The amount to buy/sell
   * @param {number} price - Current price of the coin
   * @param {string} action - "buy" or "sell"
   * @returns {Promise<Object>} - The result of the trade
   */
  export const executeTrade = async (userId, coinId, amount, price, action) => {
    if (!userId) throw new Error("User not authenticated");

    const parsedAmount = parseFloat(amount);
    const parsedPrice = parseFloat(price);
    const value = parsedAmount * parsedPrice;

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Invalid trade amount");
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      throw new Error("Invalid asset price");
    }

    // Local dev mode execution
    if (isDevUser(userId)) {
      return executeLocalTrade(userId, coinId, parsedAmount, parsedPrice, value, action);
    }

    // Standard Firestore execution for real Firebase users
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      let userData;
      if (!userSnap.exists()) {
        // Auto-initialize if user document doesn't exist in Firestore
        const defaultData = getLocalPortfolioData(userId);
        userData = {
          balance: defaultData.balance ?? 10000,
          holdings: defaultData.holdings || {}
        };
      } else {
        userData = userSnap.data();
      }

      const holdings = { ...(userData.holdings || {}) };
      let currentBalance = userData.balance ?? 10000;
      
      const tradeData = {
        type: action,
        coin: coinId.toUpperCase(),
        amount: parsedAmount,
        price: parsedPrice,
        totalValue: value,
        timestamp: serverTimestamp(),
        previousBalance: currentBalance
      };
  
      if (action === "buy") {
        if (value > currentBalance) {
          throw new Error(`Insufficient balance. You need $${value.toFixed(2)} but have $${currentBalance.toFixed(2)}`);
        }
        holdings[coinId] = (holdings[coinId] || 0) + parsedAmount;
        currentBalance = currentBalance - value;
        tradeData.newBalance = currentBalance;
      } else {
        const currentHolding = holdings[coinId] || 0;
        if (currentHolding < parsedAmount) {
          throw new Error(`Insufficient ${coinId} holdings. You have ${currentHolding} but trying to sell ${parsedAmount}`);
        }
        holdings[coinId] = parseFloat((currentHolding - parsedAmount).toFixed(8));
        if (holdings[coinId] <= 0) {
          delete holdings[coinId];
        }
        currentBalance = currentBalance + value;
        tradeData.newBalance = currentBalance;
      }
  
      const tradesRef = collection(db, "users", userId, "trades");
      const newTradeRef = await addDoc(tradesRef, tradeData);
      
      await updateDoc(userRef, {
        balance: parseFloat(currentBalance.toFixed(2)),
        holdings: holdings,
        lastUpdated: serverTimestamp()
      });
      
      // Also sync to local storage for offline resilience
      saveLocalPortfolioData(userId, { balance: parseFloat(currentBalance.toFixed(2)), holdings });
      addLocalTradeRecord(userId, { ...tradeData, id: newTradeRef.id });
      window.dispatchEvent(new CustomEvent("coinpulsex_trades_updated", { detail: { userId } }));
      window.dispatchEvent(new CustomEvent("coinpulsex_balance_updated", { detail: { balance: currentBalance, userId } }));

      return {
        success: true,
        tradeId: newTradeRef.id,
        newBalance: currentBalance,
        message: `Successfully ${action === "buy" ? "bought" : "sold"} ${parsedAmount} ${coinId}`
      };
    } catch (error) {
      console.warn("Firestore executeTrade error, switching to local storage fallback:", error);
      // Fallback to local execution so trades always succeed
      return executeLocalTrade(userId, coinId, parsedAmount, parsedPrice, value, action);
    }
  };
  
  /**
   * Get the user's portfolio summary
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - Portfolio data
   */
  export const getUserPortfolio = async (userId) => {
    if (!userId) return { balance: 10000, holdings: {} };

    if (isDevUser(userId)) {
      return getLocalPortfolioData(userId);
    }

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return getLocalPortfolioData(userId);
      }
  
      const userData = userSnap.data();
      const portfolio = {
        balance: userData.balance ?? 10000,
        holdings: userData.holdings || {}
      };
      // Keep local storage mirror up to date
      saveLocalPortfolioData(userId, portfolio);
      return portfolio;
    } catch (error) {
      console.warn("Firestore error in getUserPortfolio, using local fallback:", error.message);
      return getLocalPortfolioData(userId);
    }
  };