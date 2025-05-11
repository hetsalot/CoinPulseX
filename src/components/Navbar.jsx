import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase"; // Adjust import based on your project structure

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update state based on user authentication
    });

    return () => unsubscribe(); // Clean up the listener when the component unmounts
  }, []);

  return (
    <nav className="bg-gray-950 text-white py-4 shadow-md fixed top-0 left-0 w-full z-50 border-b-2 border-cyan-300 shadow-cyan-300">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-6 font-bold">
        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-cyan-500 via-white to-cyan-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-[gradient_4s_ease-in-out_infinite]"
        >
          CoinPulseX
        </Link>

        <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base">
          {user && (
            <>
              <Link to="/dashboard" className="hover:text-cyan-300 transition">
                Dashboard
              </Link>
              <Link to="/history" className="hover:text-cyan-300 transition">
                History
              </Link>
              <Link to="/portfolio" className="hover:text-cyan-300 transition">
                Portfolio
              </Link>
            </>
          )}
          <Link to="/about" className="hover:text-cyan-300 transition">
            About
          </Link>
          <Link to="/" className="hover:text-cyan-300 transition">
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
