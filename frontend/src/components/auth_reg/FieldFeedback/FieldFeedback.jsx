// src/components/auth_reg/FieldFeedback/FieldFeedback.jsx
import { useEffect, useState } from "react";
import "./FieldFeedback.css";

export function FieldFeedback({ message, type = "error", onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      // Сначала скрываем
      setIsVisible(false);
      
      // Показываем с анимацией
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message) return null;

  const getIcon = () => {
    switch(type) {
      case "error":
        return "⚠️";
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className={`field-feedback-toast field-feedback-toast-${type} ${isVisible ? 'visible' : ''}`}>
      <div className="field-feedback-toast-content">
        <span className="field-feedback-toast-icon">{getIcon()}</span>
        <span className="field-feedback-toast-message">{message}</span>
        <button className="field-feedback-toast-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
}