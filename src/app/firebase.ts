import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDYgCHlflSVMDNxn3WJzoWCc1tOLBZUULo",
    authDomain: "tasknet-4bede.firebaseapp.com",
    projectId: "tasknet-4bede",
    storageBucket: "tasknet-4bede.firebasestorage.app",
    messagingSenderId: "816574519721",
    appId: "1:816574519721:web:1ad265ce1cf6af657c0cb8",
    measurementId: "G-TS820424K4"
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
