import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [privileges, setPrivileges] = useState([]); // <-- New state to store granular UBAC tokens
  const [loading, setLoading] = useState(true); 

  // 1. REGISTER WORKFLOW
  const register = async (email, password, userData, userRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userProfile = {
        uid: firebaseUser.uid,
        email: email.toLowerCase(),
        role: userRole,
        status: userRole === 'tutor' ? 'pending' : 'active', 
        privileges: userRole === 'validator' ? [] : undefined, // <-- Initialize empty array for validators
        ...userData,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userProfile);

      // Keep custom fields attached to user state instance
      setUser({ 
        ...firebaseUser, 
        role: userProfile.role, 
        status: userProfile.status,
        privileges: userProfile.privileges || [] 
      });
      setRole(userRole);
      setPrivileges(userProfile.privileges || []);
      
      return userProfile;
    } catch (error) {
      console.error("Auth Engine Registration Failure:", error);
      throw error;
    }
  };

  // 2. LOGIN WORKFLOW
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        
        // Inject database metadata parameters including UBAC privileges array into global state instance
        setUser({
          ...userCredential.user,
          role: profileData.role,
          status: profileData.status,
          name: profileData.name,
          privileges: profileData.privileges || []
        });
        setRole(profileData.role);
        setPrivileges(profileData.privileges || []);
        
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
    setPrivileges([]); // <-- Reset privileges vector completely upon session termination
  };

  // 4. SESSION OBSERVER LIFECYCLE HOOK
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data();
            
            setUser({
              ...firebaseUser,
              role: profileData.role,
              status: profileData.status,
              name: profileData.name,
              privileges: profileData.privileges || []
            });
            setRole(profileData.role);
            setPrivileges(profileData.privileges || []);
          }
        } catch (err) {
          console.error("Session lifecycle state resolution crash:", err);
        }
      } else {
        setUser(null);
        setRole(null);
        setPrivileges([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, privileges, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);