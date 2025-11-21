// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDff-WXtwgNxvmegV4O9ItmBR4u9SbKO2s",
  authDomain: "coaster-2bbbb.firebaseapp.com",
  projectId: "coaster-2bbbb",
  storageBucket: "coaster-2bbbb.firebasestorage.app",
  messagingSenderId: "453317356946",
  appId: "1:453317356946:web:2cfde2fdf3024338b9a54b",
  measurementId: "G-L32PCQPQHK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);