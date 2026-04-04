import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

import { AuthProvider }  from "./context/AuthContext";
import { CartProvider }  from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import 'leaflet/dist/leaflet.css'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1C1C1C",
            color: "#F7F3EC",
            fontFamily: "'Jost', sans-serif",
            fontSize: "12px",
            letterSpacing: "0.08em",
            border: "1px solid #333",
            borderRadius: "0",
            padding: "12px 18px",
          },
          success: { iconTheme: { primary: "#B8934A", secondary: "#1C1C1C" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#1C1C1C" } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
