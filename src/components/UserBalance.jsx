import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { getUserPortfolio } from "../config/tradeService";

const UserBalance = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setBalance(0);
      return;
    }

    // Initial balance load from tradeService
    getUserPortfolio(user.uid).then((data) => {
      if (data?.balance !== undefined) {
        setBalance(data.balance);
      }
    });

    // Listen to real-time local balance updates (fired by executeTrade)
    const handleBalanceUpdate = (e) => {
      if (e.detail?.balance !== undefined) {
        // If event specifies userId, ensure it matches or update anyway
        if (!e.detail.userId || e.detail.userId === user.uid) {
          setBalance(e.detail.balance);
          setError(null);
        }
      }
    };
    window.addEventListener("coinpulsex_balance_updated", handleBalanceUpdate);

    // If local dev user or pure local environment, local event listener is sufficient
    if (user.isLocalDev) {
      return () => {
        window.removeEventListener("coinpulsex_balance_updated", handleBalanceUpdate);
      };
    }

    // For real Firebase user, attempt Firestore snapshot synchronization
    let unsubscribeSnapshot = () => {};
    try {
      const userDocRef = doc(db, "users", user.uid);
      unsubscribeSnapshot = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.balance !== undefined) {
              setBalance(data.balance);
            }
            setError(null);
          } else {
            // Document doesn't exist yet in Firestore, use local balance
            getUserPortfolio(user.uid).then((data) => {
              if (data?.balance !== undefined) setBalance(data.balance);
            });
          }
        },
        (err) => {
          // Silent fallback to local storage
          getUserPortfolio(user.uid).then((data) => {
            if (data?.balance !== undefined) setBalance(data.balance);
          });
        }
      );
    } catch {
      getUserPortfolio(user.uid).then((data) => {
        if (data?.balance !== undefined) setBalance(data.balance);
      });
    }

    return () => {
      window.removeEventListener("coinpulsex_balance_updated", handleBalanceUpdate);
      unsubscribeSnapshot();
    };
  }, [user, refreshTrigger]);

  if (error) {
    return (
      <span className="text-red-500" title={error}>
        $0
      </span>
    );
  }

  return <span className="font-bold">${balance.toLocaleString()}</span>;
};

export default UserBalance;
