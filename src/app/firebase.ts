import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyDYgCHlflSVMDNxn3WJzoWCc1tOLBZUULo",
    authDomain: "tasknet-4bede.firebaseapp.com",
    projectId: "tasknet-4bede",
    storageBucket: "tasknet-4bede.firebasestorage.app",
    messagingSenderId: "816574519721",
    appId: "1:816574519721:web:1ad265ce1cf6af657c0cb8",
    measurementId: "G-TS820424K4"
}

// const firebaseConfig = {
//     apiKey: process.env.FIREBASE_API_KEY,
//     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.FIREBASE_APPID,
//     measurementId: process.env.FIREBASE_MEASUREMENT_ID
// }

const app = initializeApp(firebaseConfig);

export { app };
