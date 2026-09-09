import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoutes = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-semibold">Verifying session...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" replace />;
};

export default PrivateRoutes;
