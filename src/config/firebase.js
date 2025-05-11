// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";  // Importing getAuth and GoogleAuthProvider
import { getFirestore } from "firebase/firestore";  // Import Firestore functions

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDo5isQkA6HNrvg6Gp7StC8-ug_oYiSzYw",
  authDomain: "coinpulsex-a3871.firebaseapp.com",
  projectId: "coinpulsex-a3871",
  storageBucket: "coinpulsex-a3871.appspot.com",  // Corrected storageBucket URL
  messagingSenderId: "503518550277",
  appId: "1:503518550277:web:c9684f6f0a062297b3ff6c"
};

// Initialize Firebase  
const app = initializeApp(firebaseConfig);

 const auth = getAuth(app);  
 const db = getFirestore(app);  
 const provider = new GoogleAuthProvider();  
provider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, db, provider };