// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';

import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBOsMGpV21arq46E_KE_DGQ9OLwW4vdBxg',
  authDomain: 'fairnest-abe1e.firebaseapp.com',
  projectId: 'fairnest-abe1e',
  storageBucket: 'fairnest-abe1e.firebasestorage.app',
  messagingSenderId: '636482035002',
  appId: '1:636482035002:web:320bcde6b0ae90c5424403',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
