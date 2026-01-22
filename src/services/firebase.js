export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

export const firebaseRoles = {
  superadmin: "superadmin",
  admin: "admin",
  operador: "operador",
  lector: "lector"
};

export const firebaseNotes = {
  message:
    "Configura Firebase en src/services/firebase.js y reemplaza las claves. Este demo usa LocalStorage para simular datos."
};
