const express = require('express');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const serviceAccount = require('./firebase-key.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

// ==========================================
// 1. SECURE BACKEND REGISTER ENDPOINT (WITH AUTO STAFF UPGRADE)
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role, userData } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Missing required registration fields.' });
    }

    const formattedEmail = email.toLowerCase().trim();

    // 🔍 1. Check if this email exists in pre_authorized_staff registry
    const preAuthRef = db.collection('pre_authorized_staff').doc(formattedEmail);
    const preAuthDoc = await preAuthRef.get();

    let finalRole = role; // Default fallback (student or tutor from front-end)
    let additionalStaffData = { privileges: [] };
    let isPreAuthStaff = false;

    if (preAuthDoc.exists) {
      // 🎯 Bingo! This is a pre-authorized Academic Validator or System Admin
      const preAuthData = preAuthDoc.data();
      finalRole = preAuthData.role; // Auto override 'student' -> 'validator'/'admin'
      additionalStaffData = {
        institution: preAuthData.institution || 'LNBTI',
        privileges: preAuthData.privileges || []
      };
      isPreAuthStaff = true;
    }

    // 2. Provision the user in Firebase Authentication
    const userRecord = await auth.createUser({
      email: formattedEmail,
      password: password,
      displayName: userData.name || 'User'
    });

    // 3. Construct the comprehensive User Profile Node for Firestore
    const userProfile = {
      uid: userRecord.uid,
      email: formattedEmail,
      role: finalRole, // Assigned safe verified role
      status: finalRole === 'tutor' ? 'pending' : 'active',
      
      // FIXED: Injecting explicit joined date node for Admin Dashboard lookup
      joined: new Date().toISOString().split('T')[0], 
      
      ...userData,
      ...additionalStaffData, // Inject institution and permissions array dynamically
      createdAt: new Date().toISOString()
    };

    // Save profile record into main 'users' collection
    await db.collection('users').doc(userRecord.uid).set(userProfile);

    // 4. If they were staff, remove their node from pre_authorized_staff to complete the lifecycle
    if (isPreAuthStaff) {
      await preAuthRef.delete();
    }

    // 5. Generate secure JWT for app access state
    const appToken = jwt.sign(
      { id: userRecord.uid, role: finalRole },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      token: appToken,
      user: userProfile
    });

  } catch (error) {
    console.error('Backend Operational Registration Failure:', error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ message: 'The email address is already registered in our system.' });
    }
    if (error.code === 'auth/invalid-password') {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    return res.status(500).json({ message: error.message || 'Server error during registration.' });
  }
});

// ==========================================
// CENTRALIZED LOGIN & GOOGLE GATEWAY
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password, idToken } = req.body;

  try {
    // --- APPROACH A: TOKEN-BASED AUTHENTICATION (Google Sign-In / Firebase) ---
    if (idToken) {
      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const emailFromToken = decodedToken.email;
      const nameFromToken = decodedToken.name || 'Google User';

      let userDoc = await db.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        console.log(`🌐 First-time Google login intercepted. Halting registration for Profile Completion: ${uid}`);
        return res.status(200).json({
          status: 'profile_incomplete',
          uid: uid,
          email: emailFromToken,
          name: nameFromToken
        });
      }

      const userData = userDoc.data();

      if (userData.status === 'suspended') {
        return res.status(403).json({ message: 'Your account has been suspended!' });
      }

      const appToken = jwt.sign(
        { id: uid, role: userData.role },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '1d' }
      );

      return res.status(200).json({
        token: appToken,
        user: { id: uid, ...userData }
      });
    }

    // --- APPROACH B: PASSWORD-BASED AUTHENTICATION ---
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide valid email and password.' });
    }

    const userSnapshot = await db.collection('users')
      .where('email', '==', email.toLowerCase().trim())
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'User not found!' });
    }

    let userData = null;
    let userId = null;

    userSnapshot.forEach(doc => {
      userData = doc.data();
      userId = doc.id;
    });

    if (userData.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended!' });
    }

    if (
      userData.password &&
      (userData.password.startsWith('$2a$') || userData.password.startsWith('$2b$'))
    ) {
      const isMatch = await bcrypt.compare(password, userData.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials!' });
      }

      const appToken = jwt.sign(
        { id: userId, role: userData.role },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '1d' }
      );

      delete userData.password;

      return res.status(200).json({
        token: appToken,
        user: { id: userId, ...userData }
      });
    }

    return res.status(400).json({ message: 'Invalid identity target authentication method.' });

  } catch (error) {
    console.error('Unified Login Gateway Operational Failure:', error);
    res.status(500).json({ message: 'Server error during authentication processing phase' });
  }
});

// ==========================================
// COMPLETE GOOGLE REGISTRATION ENDPOINT
// ==========================================
app.post('/api/auth/complete-google-registration', async (req, res) => {
  const { uid, email, name, phone, dob, role } = req.body;

  try {
    if (!uid || !email || !phone || !dob) {
      return res.status(400).json({ message: 'Missing required profile completion parameters.' });
    }

    const userCheck = await db.collection('users').doc(uid).get();
    if (userCheck.exists) {
      return res.status(400).json({ message: 'Profile configuration already established.' });
    }

    const newGoogleProfile = {
      uid: uid,
      email: email.toLowerCase().trim(),
      name: name,
      phone: phone,
      dob: dob,
      role: role || 'student',
      status: 'active',
      
      // 📅 ✅ FIXED: Injecting joined date for Google authenticated accounts too
      joined: new Date().toISOString().split('T')[0], 
      
      privileges: [],
      createdAt: new Date().toISOString()
    };

    await db.collection('users').doc(uid).set(newGoogleProfile);

    const appToken = jwt.sign(
      { id: uid, role: newGoogleProfile.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      token: appToken,
      user: newGoogleProfile
    });

  } catch (error) {
    console.error('Google Profile Finalization Failure:', error);
    return res.status(500).json({ message: 'Server error finalizing profile setups.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});