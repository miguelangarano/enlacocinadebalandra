import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import app from 'firebase'
const firebaseConfig = {
  apiKey: "AIzaSyCaa1p718IvL1kikU45UHAJINFbQWo6Fi8",
  authDomain: "enlacocinabalandra.firebaseapp.com",
  databaseURL: "https://enlacocinabalandra-default-rtdb.firebaseio.com",
  projectId: "enlacocinabalandra",
  storageBucket: "enlacocinabalandra.appspot.com",
  messagingSenderId: "120769017937",
  appId: "1:120769017937:web:ab9a0b13f8032973626070"
};
app.initializeApp(firebaseConfig)
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
