import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";

const PrivateRoutes = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  return user ? children : <Navigate to="/" />;
};

export default PrivateRoutes;
