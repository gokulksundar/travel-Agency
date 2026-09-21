// Firebase Project Credentials Configuration
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDwAD-YReM-IGmSCnqX0UIaYmeAyWmiFQw",
    authDomain: "travel-test-o7.firebaseapp.com",
    projectId: "travel-test-o7",
    storageBucket: "travel-test-o7.firebasestorage.app",
    messagingSenderId: "1089543591951",
    appId: "1:1089543591951:web:8c2ed47e2523c1c0a8eb7a",
    measurementId: "G-ZNZYPN23L5"
};

// Global Firebase Firestore Instance
let db = null;
let firebaseInitialized = false;

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(FIREBASE_CONFIG);
        db = firebase.firestore();
        firebaseInitialized = true;
        console.log("🔥 Firebase initialized successfully with travel-test-o7");
    }
} catch (error) {
    console.warn("⚠️ Firebase connection error, falling back to LocalStorage:", error);
}