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
// 🚀 1. SECURE BACKEND REGISTER ENDPOINT
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role, userData } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Missing required registration fields.' });
    }

    const userRecord = await auth.createUser({
      email: email.toLowerCase().trim(),
      password: password,
      displayName: userData.name || 'User'
    });

    const userProfile = {
      uid: userRecord.uid,
      email: email.toLowerCase().trim(),
      role: role,
      status: role === 'tutor' ? 'pending' : 'active',
      privileges: [],
      ...userData,
      createdAt: new Date().toISOString()
    };

    await db.collection('users').doc(userRecord.uid).set(userProfile);

    const appToken = jwt.sign(
      { id: userRecord.uid, role: role },
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
      return res.status(400).json({
        message: 'The email address is already registered in our system.'
      });
    }

    if (error.code === 'auth/invalid-password') {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.'
      });
    }

    return res.status(500).json({
      message: error.message || 'Server error during registration workflow processing phase.'
    });
  }
});

// ==========================================
// 🔐 2. CENTRALIZED LOGIN & GOOGLE GATEWAY
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password, idToken } = req.body;

  try {
    // --- APPROACH A: TOKEN-BASED AUTHENTICATION (For Students, Tutors & Google Sign-In) ---
    if (idToken) {
      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const emailFromToken = decodedToken.email;
      const nameFromToken = decodedToken.name || 'Google User';

      let userDoc = await db.collection('users').doc(uid).get();
      let userData;

      // 🌟 FIXED: If user document doesn't exist in Firestore, register them automatically on the fly!
      if (!userDoc.exists) {
        console.log(`🌐 First-time Google login detected. Auto-creating Firestore document for UID: ${uid}`);
        
        const newProfile = {
          uid: uid,
          email: emailFromToken.toLowerCase().trim(),
          name: nameFromToken,
          role: 'student', // Default role for Google single-sign-on users
          status: 'active',
          privileges: [],
          createdAt: new Date().toISOString()
        };

        await db.collection('users').doc(uid).set(newProfile);
        userData = newProfile;
      } else {
        // If user already exists, extract the document data cleanly
        userData = userDoc.data();
      }

      if (userData.status === 'suspended') {
        return res.status(403).json({
          message: 'Your account has been suspended!'
        });
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

    // --- APPROACH B: LEGACY PASSWORD-BASED AUTHENTICATION (Strictly for Seeded Super Admin) ---
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide valid email and password.'
      });
    }

    const userSnapshot = await db.collection('users')
      .where('email', '==', email.toLowerCase().trim())
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({
        message: 'User not found!'
      });
    }

    let userData = null;
    let userId = null;

    userSnapshot.forEach(doc => {
      userData = doc.data();
      userId = doc.id;
    });

    if (userData.status === 'suspended') {
      return res.status(403).json({
        message: 'Your account has been suspended!'
      });
    }

    if (
      userData.password &&
      (userData.password.startsWith('$2a$') ||
        userData.password.startsWith('$2b$'))
    ) {
      const isMatch = await bcrypt.compare(password, userData.password);

      if (!isMatch) {
        return res.status(400).json({
          message: 'Invalid credentials!'
        });
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

    return res.status(400).json({
      message: 'Invalid identity target authentication method.'
    });

  } catch (error) {
    console.error('Unified Login Gateway Operational Failure:', error);

    res.status(500).json({
      message: 'Server error during authentication processing phase'
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});