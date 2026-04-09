import { useState, useCallback, useRef, useEffect } from 'react';

type FeedbackType = 'error' | 'success' | 'warning';

interface FeedbackState {
  message: string;
  type: FeedbackType;
  visible: boolean;
}

export function useFieldFeedback() {
  const [feedback, setFeedback] = useState<FeedbackState>({
    message: '',
    type: 'error',
    visible: false,
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const showFeedback = useCallback((message: string, type: FeedbackType = 'error') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setFeedback({ message: '', type: 'error', visible: false });

    setTimeout(() => {
      setFeedback({ message, type, visible: true });
      timeoutRef.current = setTimeout(() => {
        setFeedback(prev => ({ ...prev, visible: false }));
        timeoutRef.current = null;
      }, 7000);
    }, 100);
  }, []);

  const hideFeedback = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setFeedback({ message: '', type: 'error', visible: false });
  }, []);

  return {
    feedback: feedback.visible ? feedback : null,
    showFeedback,
    hideFeedback,
  };
}