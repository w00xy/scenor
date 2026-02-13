// src/hooks/useFieldFeedback.js (упрощенная версия)
import { useState, useCallback } from 'react';

export function useFieldFeedback() {
  const [feedback, setFeedback] = useState({
    message: '',
    type: 'error',
    visible: false,
    key: 0 // Добавляем ключ для принудительного ререндера
  });

  const showFeedback = useCallback((message, type = 'error') => {
    // Полностью скрываем текущее уведомление
    setFeedback({
      message: '',
      type: 'error',
      visible: false,
      key: Date.now() // Меняем ключ
    });

    // Показываем новое с небольшой задержкой
    setTimeout(() => {
      setFeedback({
        message,
        type,
        visible: true,
        key: Date.now() + 1
      });

      const timeoutId = setTimeout(() => {
        setFeedback(prev => ({ 
          ...prev, 
          visible: false,
          key: Date.now() + 2 
        }));
      }, 7000);

    }, 100);
  }, []);

  const hideFeedback = useCallback(() => {
    setFeedback({
      message: '',
      type: 'error',
      visible: false,
      key: Date.now()
    });
  }, []);

  return {
    feedback: feedback.visible ? feedback : null,
    showFeedback,
    hideFeedback
  };
}