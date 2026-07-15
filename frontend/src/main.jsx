// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { UserProvider } from "./context/UserContext";
import { TripProvider } from "./context/TripContext";

import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <UserProvider>
          <TripProvider>
            <App />
          </TripProvider>
        </UserProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
