import React, { createContext, useContext, ReactNode } from 'react';
import { useFieldFeedback } from '../hooks/useFieldFeedback';
import { FieldFeedback } from '../components/auth_reg/FieldFeedback/FieldFeedback';

type FeedbackType = 'error' | 'success' | 'warning';

interface FieldFeedbackContextType {
  showFeedback: (message: string, type?: FeedbackType) => void;
  hideFeedback: () => void;
}

const FieldFeedbackContext = createContext<FieldFeedbackContextType | undefined>(undefined);

export const FieldFeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { feedback, showFeedback, hideFeedback } = useFieldFeedback();

  return (
    <FieldFeedbackContext.Provider value={{ showFeedback, hideFeedback }}>
      {children}
      {feedback && (
        <FieldFeedback
          message={feedback.message}
          type={feedback.type}
          onClose={hideFeedback}
        />
      )}
    </FieldFeedbackContext.Provider>
  );
};

export const useFieldFeedbackContext = (): FieldFeedbackContextType => {
  const context = useContext(FieldFeedbackContext);
  if (!context) {
    throw new Error('useFieldFeedbackContext must be used within FieldFeedbackProvider');
  }
  return context;
};