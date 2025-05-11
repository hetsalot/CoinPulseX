import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

const UserBalance = () => {
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setError("Not logged in");
        return;
      }

      const db = getFirestore();
      const userDocRef = doc(db, "users", user.uid);

      // Live balance
      const unsubscribeSnapshot = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setBalance(data.balance || 0);
          }
        },
        (err) => setError(err.message)
      );

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  if (error)
    return (
      <span className="text-red-500" title={error}>
        $0
      </span>
    );

  return <span className="font-bold">${balance.toLocaleString()}</span>;
};

export default UserBalance;
