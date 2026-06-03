// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";        
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqRwnYE3HwuIwyWuQvXZd44U_LFaoAVEw",
  authDomain: "langoora.firebaseapp.com",
  databaseURL: "https://langoora-default-rtdb.firebaseio.com",
  projectId: "langoora",
  storageBucket: "langoora.firebasestorage.app",
  messagingSenderId: "30330129268",
  appId: "1:30330129268:web:2662648d3157d529583a21",
  measurementId: "G-CN29S2L9YV"
};

// Initialize Firebase Application Context
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Services and Export references for global architecture
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 