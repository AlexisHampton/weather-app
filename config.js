
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
//import { collection, getDocs, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
//import { query, orderBy, limit, where, onSnapshot } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBg0fvqiK9RVX0CLrzIcEus4-mG7_bkyow",
  authDomain: "weather-app-8cd06.firebaseapp.com",
  projectId: "weather-app-8cd06",
  storageBucket: "weather-app-8cd06.appspot.com",
  messagingSenderId: "1079802645833",
  appId: "1:1079802645833:web:6674b8f6a77137a19f9e98",
  measurementId: "G-C4PNB32ZSS"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);
