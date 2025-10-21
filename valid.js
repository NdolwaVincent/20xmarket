// auth.js — Background Access Verification (Stable + Silent)
// -----------------------------------------------------------

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

// Retrieve stored credentials
const phone = localStorage.getItem("phone");
const accessCode = localStorage.getItem("accessCode");

let expiryDate = null;

// 🧠 Verify access and handle page control
async function verifyAccess() {
  // Missing info = not logged in
  if (!phone || accessCode !== FIXED_ACCESS_CODE) {
    silentRedirect();
    return;
  }

  try {
    const userRef = ref(db, "DailyPayments/" + phone);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      silentRedirect();
      return;
    }

    const userData = snapshot.val();
    expiryDate = new Date(userData.expiry);
    const now = new Date();

    // Expired?
    if (expiryDate < now) {
      silentRedirect();
      return;
    }

    // ✅ Access is valid
    console.log("Access verified for:", phone);
    console.log("Valid until:", expiryDate.toISOString());

    // Store latest expiry date in localStorage
    localStorage.setItem("expiryDate", expiryDate.toISOString());

    // Continue staying in the current page (dashb.html)
    startAutoCheck();

  } catch (error) {
    console.error("Verification error:", error);
    // Fallback: retry after short delay (for slow Firebase responses)
    setTimeout(verifyAccess, 3000);
  }
}

// 🔁 Check expiry periodically (every minute)
function startAutoCheck() {
  setInterval(() => {
    const now = new Date();
    if (expiryDate && now >= expiryDate) {
      silentRedirect();
    }
  }, 60000);
}

// 🚪 Redirect silently to index.html and clear data
function silentRedirect() {
  localStorage.removeItem("accessCode");
  localStorage.removeItem("phone");
  localStorage.removeItem("expiryDate");
  if (!window.location.href.includes("index.html")) {
    window.location.href = "index.html";
  }
}

// 🚀 Run verification after short delay (ensures Firebase loads)
setTimeout(verifyAccess, 1000);
