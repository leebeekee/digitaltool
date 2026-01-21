import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrD8YoBR2H9pNxoB2fp4OrXzT0rUZi9eI",
  authDomain: "digitalreading-88e21.firebaseapp.com",
  projectId: "digitalreading-88e21",
  storageBucket: "digitalreading-88e21.firebasestorage.app",
  messagingSenderId: "840443063207",
  appId: "1:840443063207:web:51e7a8afc18be3c541a482",
  measurementId: "G-DR4H5E0VYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
