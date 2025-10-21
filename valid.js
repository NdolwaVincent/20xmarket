// auth.js — Background Access Verification Script
// -----------------------------------------------

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

// Fixed Access Code
const FIXED_ACCESS_CODE = "778899";

// Retrieve data from localStorage
const phone = localStorage.getItem("phone");
const accessCode = localStorage.getItem("accessCode");

let expiryDate = null;

// 🧠 Verify user access silently
async function verifyAccess() {
  if (!phone || accessCode !== FIXED_ACCESS_CODE) {
    redirectWithMessage("Access denied. Please make a valid payment first.");
    return;
  }

  const userRef = ref(db, "DailyPayments/" + phone);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    redirectWithMessage("No valid payment found. Please pay again.");
    return;
  }

  const userData = snapshot.val();
  expiryDate = new Date(userData.expiry);
  const now = new Date();

  if (expiryDate < now) {
    redirectWithMessage("Your payment period has expired. Please renew.");
    return;
  }

  // ✅ Access is valid — start background checks
  console.log(`✅ Access granted for ${userData.phone}, valid until ${expiryDate.toDateString()}`);
  startAutoCheck();
}

// 🔁 Auto-check expiry every 1 minute
function startAutoCheck() {
  setInterval(() => {
    const now = new Date();
    if (expiryDate && now >= expiryDate) {
      redirectWithMessage("⚠️ Your access has expired. Please renew payment to continue.");
    }
  }, 60000);
}

// 🚪 Logout and redirect
function redirectWithMessage(message) {
  alert(message);
  localStorage.removeItem("accessCode");
  localStorage.removeItem("phone");
  window.location.href = "index.html";
}

// 🚀 Run verification immediately when loaded
verifyAccess();
