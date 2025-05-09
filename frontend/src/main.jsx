import { createRoot } from "react-dom/client";
import "./index.css";
import 'react-toastify/dist/ReactToastify.css';
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ShopContextProvider } from "./context/ShopContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={clientID}>
    <BrowserRouter>
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
