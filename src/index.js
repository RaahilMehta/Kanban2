import React from 'react';
import ReactDOM from 'react-dom/client'; // Use the new import
import './index.css'; // Import your CSS
import App from './App'; // Adjust the import path if necessary

// Create a root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
