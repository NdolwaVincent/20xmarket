// auth.js — Background Access Verification Script (Silent Mode)
// --------------------------------------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 🔥 Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtB199eH6fONCftI_B6IDP80_0Tv2dFN8",
  authDomain: "m-sales-45b35.firebaseapp.com",
  databaseURL: "https://m-sales-45b35-default-rtdb.firebaseio.com",
  projectId: "m-sales-45b35",
  storageBucket: "m-sales-45b35.appspot.com",
  messagingSenderId: "194892525308",
  appId: "1:194892525308:web:c01af3028c85abdb97f179"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Fixed access code
const FIXED_ACCESS_CODE = "778899";

// Retrieve stored login data
const phone = localStorage.getItem("phone");
const accessCode = localStorage.getItem("accessCode");

let expiryDate = null;

// 🧠 Silent Access Verification
async function verifyAccess() {
  try {
    // If missing phone or wrong access code, redirect silently
    if (!phone || accessCode !== FIXED_ACCESS_CODE) {
      silentRedirect();
      return;
    }

    const userRef = ref(db, "DailyPayments/" + phone);
    const snapshot = await get(userRef);

    // If no payment record found, redirect silently
    if (!snapshot.exists()) {
      silentRedirect();
      return;
    }

    const userData = snapshot.val();
    expiryDate = new Date(userData.expiry);
    const now = new Date();

    // If expired, redirect silently
    if (expiryDate < now) {
      silentRedirect();
      return;
    }

    // ✅ Access is valid — continue and check periodically
    startAutoCheck();

  } catch (error) {
    // On any error (e.g. Firebase fetch failure), redirect silently
    silentRedirect();
  }
}

// 🔁 Background expiry checker (every minute)
function startAutoCheck() {
  setInterval(() => {
    const now = new Date();
    if (expiryDate && now >= expiryDate) {
      silentRedirect();
    }
  }, 60000);
}

// 🚪 Silent redirect and cleanup
function silentRedirect() {
  localStorage.removeItem("accessCode");
  localStorage.removeItem("phone");
  window.location.href = "index.html";
}

// 🚀 Run verification as soon as script loads
verifyAccess();
