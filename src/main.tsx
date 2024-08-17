import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MorningRoutineTimer from "./morning-routine-timer.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MorningRoutineTimer />
  </StrictMode>
);
