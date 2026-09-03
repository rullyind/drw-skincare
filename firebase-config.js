// ===============================================
// RARA CHESS ONLINE — FIREBASE CONFIG
// ===============================================
// Tempel konfigurasi Web App Firebase milik Anda di sini.
// Firebase Console → Project settings → Your apps → Web app.
//
// Contoh:
// export const firebaseConfig = {
//   apiKey: "AIza...",
//   authDomain: "project.firebaseapp.com",
//   databaseURL: "https://project-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "project",
//   storageBucket: "project.firebasestorage.app",
//   messagingSenderId: "123456789",
//   appId: "1:123:web:abc"
// };

export const firebaseConfig = {
  apiKey: "TEMPEL_API_KEY_ANDA",
  authDomain: "TEMPEL_PROJECT.firebaseapp.com",
  databaseURL: "TEMPEL_DATABASE_URL_ANDA",
  projectId: "TEMPEL_PROJECT_ID",
  storageBucket: "TEMPEL_STORAGE_BUCKET",
  messagingSenderId: "TEMPEL_MESSAGING_SENDER_ID",
  appId: "TEMPEL_APP_ID"
};

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkOtRf8wTkf9l5muiFkNYV1zf5mkZaW5U",
  authDomain: "d2t-catur-online.firebaseapp.com",
  projectId: "d2t-catur-online",
  storageBucket: "d2t-catur-online.firebasestorage.app",
  messagingSenderId: "509688503626",
  appId: "1:509688503626:web:92d11e1b61a639613f75b3",
  measurementId: "G-C4XJKZ6Q7J"
};

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkOtRf8wTkf9l5muiFkNYV1zf5mkZaW5U",
  authDomain: "d2t-catur-online.firebaseapp.com",
  projectId: "d2t-catur-online",
  storageBucket: "d2t-catur-online.firebasestorage.app",
  messagingSenderId: "509688503626",
  appId: "1:509688503626:web:92d11e1b61a639613f75b3",
  measurementId: "G-C4XJKZ6Q7J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);