// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {Firestore, getFirestore} from 'firebase/firestore'
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBamlM-2WwCWWMs2HDtENkU3G_4SM5sDM4",
  authDomain: "webrtc-8124d.firebaseapp.com",
  projectId: "webrtc-8124d",
  storageBucket: "webrtc-8124d.appspot.com",
  messagingSenderId: "182734991063",
  appId: "1:182734991063:web:d7e5a7ccd4f2f6f5860a92",
  measurementId: "G-KEH913GD4Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const firestore = getFirestore(app)