// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDOeA9__EGK09QnHD4uifvDYx4VNZvqV84",
  authDomain: "ecommerceapp-a5273.firebaseapp.com",
  databaseURL: "https://ecommerceapp-a5273-default-rtdb.firebaseio.com",
  projectId: "ecommerceapp-a5273",
  storageBucket: "ecommerceapp-a5273.appspot.com",
  messagingSenderId: "245935274455",
  appId: "1:245935274455:web:81091e9f4df7e0e2c57392"
};

const app = initializeApp(firebaseConfig); 
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { app, auth, database, storage };
