import { createRoot } from "react-dom/client";
import App from "../app/page";
import "../app/globals.css";
import "../app/emergency.css";
import "../app/environment.css";
import "../app/chain-v2.css";
import "../app/platform-ops.css";
import "../app/risk.css";
import "../app/communications.css";
import "../app/synthetic-runtime.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Elemento raiz da aplicação não encontrado.");
}

createRoot(root).render(<App />);
