import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Auth } from "./pages/authorization/Auth.js";
import { Reg } from "./pages/registration/Reg";
import { FieldFeedbackProvider } from "./context/FieldFeedbackContext";

export default function App() {
  return (
    <FieldFeedbackProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Reg />} />
        </Routes>
      </BrowserRouter>
    </FieldFeedbackProvider>
  );
}
