import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyC2t_EZA4fVtM4qyzxa0F4Aof0Ew_LlBHw",
  authDomain: "inventarioitwillian.firebaseapp.com",
  projectId: "inventarioitwillian",
  storageBucket: "inventarioitwillian.firebasestorage.app",
  messagingSenderId: "160665865470",
  appId: "1:160665865470:web:3952ebffaf7dabaf8de9af"
};

const firebaseApp = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp);

export { collection, deleteDoc, doc, firestoreDb, onSnapshot, setDoc };

export const saveToolToFirebase = async (tool) => {
  if (!tool?.id) return;
  await setDoc(doc(firestoreDb, "tools", tool.id), tool, { merge: true });
};

export const firebaseRoles = {
  superadmin: "superadmin",
  admin: "admin",
  operador: "operador",
  lector: "lector"
};

export const firebaseNotes = {
  message:
    "Configura Firebase en src/services/firebase.js y reemplaza las claves. Este demo usa Firestore para compartir el inventario."
};
