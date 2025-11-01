// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getStorage } from "firebase/storage";
// import { getFirestore } from "firebase/firestore";
import { getDatabase, ref, child, get } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAy9ykcjhb2SIofJbDU0YVTpA6B0dRFoqA",
  authDomain: "app-mynt.firebaseapp.com",
  databaseURL: "https://app-mynt-default-rtdb.firebaseio.com",
  projectId: "app-mynt",
  storageBucket: "app-mynt.firebasestorage.app",
  messagingSenderId: "652976261222",
  appId: "1:652976261222:web:f4346b6d294a0c1e0fc5a7",
  measurementId: "G-YDNBR3CNPQ"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const analytics = getAnalytics(firebaseApp);
export { firebaseApp, analytics };
// set(ref(db, 'users/' + 'ze1a40'), {
//     username: 'name',
//     email: 'email',
//     profile_picture: 'imageUrl'
// });

// const dbRef = ref(db);
// get(child(dbRef, `desk/`)).then((snapshot) => {
//   if (snapshot.exists()) {
//     console.log(snapshot.val());
//   } else {
//     console.log("No data available");
//   }
// }).catch((error) => {
//   console.error(error);
// });
export default { db, ref, get, child };
