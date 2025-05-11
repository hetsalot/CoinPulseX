// src/services/tradeService.js

import { 
    doc, 
    collection, 
    getDocs, 
    getDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    addDoc,
    updateDoc,
    serverTimestamp 
  } from "firebase/firestore";
  import { db } from "./firebase";
  
  /**
   * Get all trades for a specific user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of trade objects
   */
  export const getUserTrades = async (userId) => {
    try {
      const tradesRef = collection(db, "users", userId, "trades");
      const q = query(tradesRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() //  Firestore timestamp to JS Date
      }));
    } catch (error) {
      console.error("Error getting user trades:", error);
      throw error;
    }
  };
  
  /**
   * Get trades for a specific coin
   * @param {string} userId - The user ID
   * @param {string} coinId - The coin ID
   * @returns {Promise<Array>} - Array of trade objects for that coin
   */
  export const getCoinTrades = async (userId, coinId) => {
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
        timestamp: doc.data().timestamp?.toDate()
      }));
    } catch (error) {
      console.error(`Error getting trades for ${coinId}:`, error);
      throw error;
    }
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
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error("User not found");
      }
  
      const userData = userSnap.data();
      const parsedAmount = parseFloat(amount);
      const parsedPrice = parseFloat(price);
      const value = parsedAmount * parsedPrice;
      
      // Ensure data structure exists
      const holdings = userData.holdings || {};
      let currentBalance = userData.balance || 0;
      
      // Create trade data
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
        // Check if user has enough balance
        if (value > currentBalance) {
          throw new Error(`Insufficient balance. You need $${value.toFixed(2)} but have $${currentBalance.toFixed(2)}`);
        }
        
        // Update holdings and balance
        holdings[coinId] = (holdings[coinId] || 0) + parsedAmount;
        currentBalance = currentBalance - value;
        tradeData.newBalance = currentBalance;
      } else {
        // Check if user has enough of the coin
        const currentHolding = holdings[coinId] || 0;
        
        if (currentHolding < parsedAmount) {
          throw new Error(`Insufficient ${coinId} holdings. You have ${currentHolding} but trying to sell ${parsedAmount}`);
        }
        
        // Update holdings and balance
        holdings[coinId] = parseFloat((currentHolding - parsedAmount).toFixed(8));
        
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
        lastUpdated: serverTimestamp()
      });
      
      return {
        success: true,
        tradeId: newTradeRef.id,
        newBalance: currentBalance,
        message: `Successfully ${action === "buy" ? "bought" : "sold"} ${parsedAmount} ${coinId}`
      };
    } catch (error) {
      console.error("Trade execution error:", error);
      throw error;
    }
  };
  
  /**
   * Get the user's portfolio summary
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - Portfolio data
   */
  export const getUserPortfolio = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error("User not found");
      }
  
      const userData = userSnap.data();
      return {
        balance: userData.balance || 0,
        holdings: userData.holdings || {}
      };
    } catch (error) {
      console.error("Error getting user portfolio:", error);
      throw error;
    }
  };