// ===== Firebase config for Phone OTP login =====
// Pasha: apne Firebase project ki config yahan paste karein
// Steps: console.firebase.google.com → New Project → Authentication → Sign-in method → Phone → Enable
// Project Settings → General → Your apps → Web app → config copy kar ke neeche paste karein
const FIREBASE_CONFIG = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};
const FIREBASE_READY = FIREBASE_CONFIG.apiKey !== "PASTE_YOUR_API_KEY";
