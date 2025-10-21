// ---------------------------------------------------------
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

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Fixed Access Code (system-wide)
const ACCESS_CODE = "778899";

// ✅ Check Access Validity Function
async function verifyAccess() {
  try {
    const accessRef = ref(db, "DailyPayments/" + ACCESS_CODE);
    const snapshot = await get(accessRef);

    if (!snapshot.exists()) {
      console.warn("⚠️ Access code not found. Redirecting...");
      window.location.href = "index.html";
      return;
    }

    const data = snapshot.val();
    const expiry = new Date(data.expiry);
    const now = new Date();

    if (now > expiry) {
      console.log("⏰ Access expired.");
      window.location.href = "index.html";
      return;
    }

    // ✅ Access valid
    console.log(`✅ Access valid until: ${expiry.toDateString()}`);
  } catch (error) {
    console.error("❌ Error verifying access:", error);
    // Fallback redirect in case of failure
    window.location.href = "index.html";
  }
}

// ⏱️ Run Check Immediately and Repeat Every 5 Minutes
verifyAccess();
setInterval(verifyAccess, 5 * 60 * 1000);
