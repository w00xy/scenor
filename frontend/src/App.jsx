// App.jsx
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Auth } from "./pages/authorization/Auth.jsx";
import { FieldFeedbackProvider } from "./context/FieldFeedbackContext"; // Добавьте импорт

export default function App() {
  return (
    <FieldFeedbackProvider>  {/* Оборачиваем весь роутер */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    </FieldFeedbackProvider>
  );
}