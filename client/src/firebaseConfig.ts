// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCC2wzkh9kNX1VY9YzMSkqaxrKrYpNOF8U",
  authDomain: "file-manager-7b2bc.firebaseapp.com",
  projectId: "file-manager-7b2bc",
  storageBucket: "file-manager-7b2bc.firebasestorage.app",
  messagingSenderId: "559044491878",
  appId: "1:559044491878:web:141b69ae906a3272a54ba7",
  measurementId: "G-65T0DSSLKD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export {auth, googleProvider, db, signInWithPopup}