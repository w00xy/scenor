import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFieldFeedbackContext } from '../context/FieldFeedbackContext';
import { authApi, setTokens } from '../services/api';

export function useLogin() {
  const { showFeedback } = useFieldFeedbackContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    e.stopPropagation();

    if (!email.trim() || !password.trim()) {
      showFeedback('Заполните все поля', 'error');
      return false;
    }

    setIsLoading(true);
    try {
      const data = await authApi.login({ email: email.trim(), password });
      setTokens(data.accessToken, data.refreshToken);
      showFeedback('Успешный вход!', 'success');
      navigate('/overview/scenario', { replace: true });
      return true;
    } catch (error: any) {
      console.error(error);
      showFeedback(error.message || 'Неверный Email или пароль', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, handleLogin, isLoading };
}