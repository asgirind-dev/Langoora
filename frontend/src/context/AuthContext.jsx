import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Importing instances from config

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'student' | 'tutor' | 'admin' | 'validator'
  const [loading, setLoading] = useState(true); // Keeps track of initial session state validation

  // 1. REGISTER WORKFLOW (Firebase Auth + Firestore Profile Mapping)
  const register = async (email, password, userData, userRole) => {
    try {
      // Create user credential entry inside Firebase Authentication core engine
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Prepare core system metadata mapping payload
      const userProfile = {
        uid: firebaseUser.uid,
        email: email.toLowerCase(),
        role: userRole,
        status: userRole === 'tutor' ? 'pending' : 'active', // Tutors require review verification gate
        ...userData,
        createdAt: new Date().toISOString()
      };

      // Atomic commit to Cloud Firestore base "users" collection context
      await setDoc(doc(db, "users", firebaseUser.uid), userProfile);

      // Handle explicit memory state injection logic for direct logins
      if (userRole !== 'tutor') {
        setUser(firebaseUser);
        setRole(userRole);
      } else {
        // Tutors sessions are structured as null upon entry to prevent bypass
        setUser(null);
        setRole(null);
      }
      return userProfile;
    } catch (error) {
      console.error("Auth Engine Registration Failure:", error);
      throw error;
    }
  };

  // 2. LOGIN WORKFLOW (Fetch metadata profiles on verification check)
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Pull identity document record mapping profile from Cloud Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setUser(userCredential.user);
        setRole(profileData.role);
        return profileData;
      } else {
        throw new Error("User metadata document profile missing inside Firestore index repository.");
      }
    } catch (error) {
      console.error("Auth Engine Identity Verification Failure:", error);
      throw error;
    }
  };

  // 3. LOGOUT WORKFLOW
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  // 4. SESSION OBSERVER LIFECYCLE HOOK
  // Runs immediately on viewport initialization to lock active sessions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data();
            
            // Check condition to filter pending validation accounts
            if (profileData.role === 'tutor' && profileData.status === 'pending') {
              setUser(null);
              setRole(null);
            } else {
              setUser(firebaseUser);
              setRole(profileData.role);
            }
          }
        } catch (err) {
          console.error("Session lifecycle state resolution crash:", err);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);