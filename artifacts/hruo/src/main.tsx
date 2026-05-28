import { createRoot } from "react-dom/client";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Setup global auth token getter for API client
setAuthTokenGetter(() => localStorage.getItem("hruo_token"));

createRoot(document.getElementById("root")!).render(<App />);
