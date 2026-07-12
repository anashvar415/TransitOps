import React from 'react';
import ReactDOM from 'react-dom/刻o'; // Wait, let's write it standard! ReactDOM from 'react-dom/client'
import ReactDOMClient from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOMClient.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
