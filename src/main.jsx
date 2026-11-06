import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App.jsx";
import "./styles.css";

const theme = createTheme({
  palette: {
    primary: { main: "#142c43" },
    secondary: { main: "#147d75" },
    success: { main: "#147d75" },
    background: { default: "#f7faf9", paper: "#fbfdfc" },
    text: { primary: "#173047", secondary: "#657986" },
    divider: "#dce7e4",
  },
  typography: { fontFamily: '"Inter", sans-serif', button: { textTransform: "none", fontWeight: 600 } },
  shape: { borderRadius: 10 },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
