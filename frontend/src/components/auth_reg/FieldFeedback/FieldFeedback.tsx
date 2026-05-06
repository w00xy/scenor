import { useEffect, useState } from "react";
import "./FieldFeedback.scss";

type FeedbackType = "error" | "success" | "warning";

interface FieldFeedbackProps {
  message: string;
  type?: FeedbackType;
  onClose: () => void;
}

export function FieldFeedback({
  message,
  type = "error",
  onClose,
}: FieldFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      // Используем setTimeout для асинхронного обновления состояния
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      return () => {
        clearTimeout(showTimer);
      };
    }
    // Сбрасываем видимость когда message становится пустым
    return () => {
      setIsVisible(false);
    };
  }, [message]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case "error":
        return "⚠️";
      case "success":
        return "✓";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  return (
    <div
      className={`field-feedback-toast field-feedback-toast-${type} ${isVisible ? "visible" : ""}`}
    >
      <div className="field-feedback-toast-content">
        <span className="field-feedback-toast-icon">{getIcon()}</span>
        <span className="field-feedback-toast-message">{message}</span>
        <button className="field-feedback-toast-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}
