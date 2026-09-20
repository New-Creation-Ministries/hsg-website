import React from "react";
import { createRoot } from "react-dom/client";

import { VisitList } from "./VisitList.jsx";

/** Fixture app root. Deliberately tiny — it exists to be proxied, not to do anything. */
function App() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>livepin vite fixture</h1>
      <VisitList />
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
