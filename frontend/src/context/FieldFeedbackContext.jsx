// src/context/FieldFeedbackContext.jsx
import { createContext, useContext } from 'react';
import { useFieldFeedback } from '../hooks/useFieldFeedback';
import { FieldFeedback } from '../components/auth_reg/FieldFeedback/FieldFeedback';

const FieldFeedbackContext = createContext(null);

export function FieldFeedbackProvider({ children }) {
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
}

export function useFieldFeedbackContext() {
  const context = useContext(FieldFeedbackContext);
  if (!context) {
    throw new Error('useFieldFeedbackContext must be used within FieldFeedbackProvider');
  }
  return context;
}