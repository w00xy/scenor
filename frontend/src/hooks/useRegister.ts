import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFieldFeedbackContext } from '../context/FieldFeedbackContext';
import { authApi, setTokens } from '../services/api';
import { validateRegistrationForm } from '../utils/validation/registrationValidation';
import { scheduleTokenRefresh } from "../services/tokenRefresher";
export function useRegister() {
  const { showFeedback } = useFieldFeedbackContext();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    e.stopPropagation();

    const validation = validateRegistrationForm(username, email, password);
    if (!validation.isValid) {
      showFeedback(validation.message, 'error');
      return false;
    }

    setIsLoading(true);
    try {
      await authApi.register(username.trim(), email.trim(), password);
      const loginData = await authApi.login({ email: email.trim(), password });
      setTokens(loginData.accessToken, loginData.refreshToken);
      scheduleTokenRefresh();
      showFeedback('Регистрация успешна!', 'success');
      navigate('/overview/scenario', { replace: true });
      return true;
    } catch (error: any) {
      console.error(error);
      showFeedback(error.message || 'Ошибка регистрации', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    handleRegister,
    isLoading,
  };
}