import { useState, useEffect } from 'react';
import { useFieldFeedbackContext } from '../context/FieldFeedbackContext';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';
import { userApi } from '../services/api';

const cookies = new Cookies();

interface JwtPayload {
  sub: string;
  email?: string;
  username?: string;
}

export function useProfile() {
  const { showFeedback } = useFieldFeedbackContext();
  const [userId, setUserId] = useState<string | null>(null);

  const [originalName, setOriginalName] = useState('');
  const [originalLastname, setOriginalLastname] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');

  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true;
    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    return phoneRegex.test(phone);
  };

  const hasChanges = () => {
    return (
      name !== originalName ||
      lastname !== originalLastname ||
      email !== originalEmail ||
      phone !== originalPhone
    );
  };

  const isValid = () => {
    return validateEmail(email) && validatePhone(phone);
  };

  const canSave = hasChanges() && isValid();

  useEffect(() => {
    const token = cookies.get('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const id = decoded.sub;
        setUserId(id);
        loadUserData(id);
      } catch (error) {
        console.error('Ошибка декодирования токена', error);
        showFeedback('Ошибка загрузки профиля', 'error');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUserData = async (id: string) => {
    try {
      const user = await userApi.getUser(id);
      setOriginalName(user.username);
      setOriginalLastname(user.lastname || '');
      setOriginalEmail(user.email);
      setOriginalPhone(user.phone || '');

      setName(user.username);
      setLastname(user.lastname || '');
      setEmail(user.email);
      setPhone(user.phone || '');
    } catch (error: any) {
      console.error(error);
      showFeedback(error.message || 'Не удалось загрузить профиль', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!canSave) return;
    if (!userId) return;

    const updateData: any = {};
    if (name !== originalName) updateData.username = name;
    if (lastname !== originalLastname) updateData.lastname = lastname;
    if (email !== originalEmail) updateData.email = email;
    if (phone !== originalPhone) updateData.phone = phone;

    try {
      await userApi.updateUser(userId, updateData);
      setOriginalName(name);
      setOriginalLastname(lastname);
      setOriginalEmail(email);
      setOriginalPhone(phone);
      showFeedback('Данные успешно обновлены', 'success');
    } catch (error: any) {
      console.error(error);
      showFeedback(error.message || 'Ошибка сохранения', 'error');
    }
  };

  return {
    name,
    setName,
    lastname,
    setLastname,
    email,
    setEmail,
    phone,
    setPhone,
    handleSave,
    isLoading,
    canSave,
    validateEmail,
    validatePhone,
  };
}