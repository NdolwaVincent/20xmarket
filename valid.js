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

// 🔐 Fixed Access Code
const FIXED_ACCESS_CODE = "778899";

// Retrieve stored user info
const phone = localStorage.getItem("phone");
const accessCode = localStorage.getItem("accessCode");

let expiryDate = null;

// 🧠 Verify access silently
async function verifyAccess() {
  // 🟥 No stored credentials → redirect immediately
  if (!phone || accessCode !== FIXED_ACCESS_CODE) {
    silentRedirect();
    return;
  }

  try {
    const userRef = ref(db, "DailyPayments/" + phone);
    const snapshot = await get(userRef);

    // 🟥 No record found
    if (!snapshot.exists()) {
      silentRedirect();
      return;
    }

    const userData = snapshot.val();

    // Ensure expiry field exists and is valid
    if (!userData.expiry) {
      silentRedirect();
      return;
    }

    expiryDate = new Date(userData.expiry);
    const now = new Date();

    // 🟥 Expired
    if (now >= expiryDate) {
      silentRedirect();
      return;
    }

    // ✅ Still valid
    console.log("✅ Access valid for:", phone, "| Expires:", expiryDate.toLocaleString());

    // Start background expiry checks
    startAutoCheck();

  } catch (error) {
    console.error("❌ Access check failed:", error);
    // Retry once after short delay
    setTimeout(verifyAccess, 3000);
  }
}

// 🔁 Recheck expiry every 1 minute
function startAutoCheck() {
  setInterval(async () => {
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

      if (now >= expiryDate) {
        console.warn("⏰ Payment expired — redirecting...");
        silentRedirect();
      }
    } catch (err) {
      console.error("Auto check failed:", err);
    }
  }, 60000);
}

// 🚪 Redirect silently to index.html
function silentRedirect() {
  localStorage.removeItem("accessCode");
  localStorage.removeItem("phone");
  if (!window.location.href.endsWith("index.html")) {
    window.location.href = "index.html";
  }
}

// 🚀 Run verification automatically
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(verifyAccess, 500);
});
