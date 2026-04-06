// Configuración de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuración de Firebase - REEMPLAZA CON TUS DATOS
const firebaseConfig = {
  apiKey: "AIzaSyBHoLKATzmyEhNXWghIpIXRbw_TqmMAC6Q",
  authDomain: "testapssgeneric.firebaseapp.com",
  projectId: "testapssgeneric",
  storageBucket: "testapssgeneric.firebasestorage.app",
  messagingSenderId: "904399972705",
  appId: "1:904399972705:web:5b5ec5a2dee087c718bd20"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencia al documento de usuarios
const USUARIOS_DOC_ID = "SECCIONB";
const usuariosDocRef = doc(db, "Usuarios", USUARIOS_DOC_ID);

export { db, usuariosDocRef, getDoc, setDoc, updateDoc };