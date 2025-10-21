// auth.js — Background Access Verification (Invisible Mode)
// ---------------------------------------------------------

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

const FIXED_ACCESS_CODE = "778899";

// Retrieve login data
const phone = localStorage.getItem("phone");
const accessCode = localStorage.getItem("accessCode");

let expiryDate = null;

// 🧠 Verify user access silently
async function verifyAccess() {
  // Missing data — redirect immediately
  if (!phone || accessCode !== FIXED_ACCESS_CODE) {
    silentRedirect();
    return;
  }

  try {
    const userRef = ref(db, "DailyPayments/" + phone);
    const snapshot = await get(userRef);

    // No payment found
    if (!snapshot.exists()) {
      silentRedirect();
      return;
    }

    const userData = snapshot.val();
    expiryDate = new Date(userData.expiry);
    const now = new Date();

    // Payment expired
    if (expiryDate < now) {
      silentRedirect();
      return;
    }

    // ✅ Valid access — stay on page silently
    console.log("Access valid for:", phone, "| Expires:", expiryDate.toISOString());

    // Start periodic background check
    startAutoCheck();

  } catch (error) {
    console.error("Access check failed:", error);
    // Retry once after delay in case of Firebase lag
    setTimeout(verifyAccess, 3000);
  }
}

// 🔁 Auto-check expiry every minute silently
function startAutoCheck() {
  setInterval(() => {
    const now = new Date();
    if (expiryDate && now >= expiryDate) {
      silentRedirect();
    }
  }, 60000);
}

// 🚪 Silent redirect to index.html
function silentRedirect() {
  localStorage.removeItem("accessCode");
  localStorage.removeItem("phone");
  if (!window.location.href.includes("index.html")) {
    window.location.href = "index.html";
  }
}

// 🚀 Run verification when script loads
setTimeout(verifyAccess, 500);
