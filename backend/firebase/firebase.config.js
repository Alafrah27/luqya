import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyArhkgyYwmva09OQtCPH7SIvdOxa6C8DgU",
  authDomain: "authphone-login.firebaseapp.com",
  projectId: "authphone-login",
  storageBucket: "authphone-login.appspot.com",
  messagingSenderId: "61118957234",
  appId: "1:61118957234:web:6856806a550466ec83ebab",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);


// expo id =0bc69e6d-9895-4c5a-bb8e-43cf5bfa96d3