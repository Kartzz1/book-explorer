import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/globals.css";
import "./styles/spatial.css";
import "./styles/responsive.css";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);