import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFieldFeedbackContext } from '../context/FieldFeedbackContext';
import { useCurrentUser } from '../context/CurrentUserContext';
import { authApi, setTokens } from '../services/api';
import { useProjects } from '../context/ProjectsContext';
export function useLogin() {
  const { showFeedback } = useFieldFeedbackContext();
  const { refreshCurrentUser } = useCurrentUser();
  const { refreshProjects } = useProjects();
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
      await refreshCurrentUser();
      await refreshProjects();
      showFeedback('Успешный вход!', 'success');
      navigate('/overview/scenario', { replace: true });
      return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showFeedback(error.message || 'Неверный Email или пароль', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, handleLogin, isLoading };
}
