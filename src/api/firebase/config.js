// db con cuenta escolar
// import {initializeApp} from 'firebase/app'

// // const firebaseConfig = {
// //   apiKey: "AIzaSyC44WJAcH--mX-RE_lcqzudMgMNZRYhPiI",
// //   authDomain: "parcialcwantonucci.firebaseapp.com",
// //   projectId: "parcialcwantonucci",
// //   storageBucket: "parcialcwantonucci.appspot.com",
// //   messagingSenderId: "1017774734051",
// //   appId: "1:1017774734051:web:5b6c9df4ea4f05819ee3d6"
// // };

// export const firebaseApp = initializeApp(firebaseConfig);



// db con mi cuenta personal
// import { initializeApp } from 'firebase/app';
// // import { initializeFirestore } from 'firebase/firestore';

// // Configuración de Firebase
// const firebaseConfig = {
//   apiKey: "AIzaSyC4rXwZ5zGlADlW9YQY2hziHvq6JMcmCsk",
//   authDomain: "voir-432421.firebaseapp.com",
//   projectId: "voir-432421",
//   storageBucket: "voir-432421.firebasestorage.app",
//   messagingSenderId: "909682604558",
//   appId: "1:909682604558:web:1b8e49226c1bfb691eda5f",
//   measurementId: "G-7CWLHV17C4"
// };

// // Inicializa la app de Firebase
// export const firebaseApp = initializeApp(firebaseConfig);

// Inicializa Firestore apuntando a la base de datos personalizada
// export const db = initializeFirestore(firebaseApp, {
//   databaseId: "db-voir-2025"
// });



import { initializeApp } from 'firebase/app';

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Inicializa la app de Firebase
export const firebaseApp = initializeApp(firebaseConfig);