// src/hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { useFieldFeedbackContext } from '../context/FieldFeedbackContext';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';
import { profileApi, userApi } from '../services/api';

const cookies = new Cookies();

const updateProfileStub = async (data: any) => {
  console.log('[Заглушка] Обновление профиля (firstName, lastName, phone):', data);
  await new Promise(resolve => setTimeout(resolve, 800));
  return { success: true };
};

const updateEmailStub = async (email: string, password: string) => {
  console.log('[Заглушка] Обновление email:', email, 'с паролем:', password);
  await new Promise(resolve => setTimeout(resolve, 800));
  return { success: true };
};

export function useProfile() {
  const { showFeedback } = useFieldFeedbackContext();
  const [userId, setUserId] = useState<string | null>(null);

  const [originalFirstName, setOriginalFirstName] = useState('');
  const [originalLastName, setOriginalLastName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingProfileUpdate, setPendingProfileUpdate] = useState<any>(null);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => !phone || /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone);

  const hasChanges = () =>
    firstName !== originalFirstName ||
    lastName !== originalLastName ||
    email !== originalEmail ||
    phone !== originalPhone;

  const isValid = () => validateEmail(email) && validatePhone(phone);
  const canSave = hasChanges() && isValid();

  useEffect(() => {
    const token = cookies.get('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode<{ sub: string }>(token);
        setUserId(decoded.sub);
        loadData(decoded.sub);
      } catch (error) {
        console.error(error);
        showFeedback('Ошибка загрузки профиля', 'error');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadData = async (id: string) => {
    try {
      const profile = await profileApi.getProfile(id);
      setOriginalFirstName(profile.firstName || '');
      setOriginalLastName(profile.lastName || '');
      setOriginalPhone(profile.phone || '');
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhone(profile.phone || '');
    } catch (error: any) {
      if (error.status === 404 || error.message?.includes('404')) {
        setOriginalFirstName('');
        setOriginalLastName('');
        setOriginalPhone('');
        setFirstName('');
        setLastName('');
        setPhone('');
      } else {
        console.error(error);
        showFeedback(error.message || 'Не удалось загрузить профиль', 'error');
      }
    }

    try {
      const user = await userApi.getUser(id);
      setOriginalEmail(user.email);
      setEmail(user.email);
    } catch (error: any) {
      console.error(error);
      showFeedback(error.message || 'Не удалось загрузить email', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Сохранение только полей профиля (без email)
  const performProfileUpdate = async (profileUpdate: any) => {
    if (Object.keys(profileUpdate).length === 0) return;
    try {
      // Здесь должен быть реальный вызов profileApi.updateProfile (но он не принимает email)
      // Пока используем заглушку
      await updateProfileStub(profileUpdate);
      if (profileUpdate.firstName !== undefined) setOriginalFirstName(profileUpdate.firstName);
      if (profileUpdate.lastName !== undefined) setOriginalLastName(profileUpdate.lastName);
      if (profileUpdate.phone !== undefined) setOriginalPhone(profileUpdate.phone);
      showFeedback('Данные профиля обновлены', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Ошибка сохранения профиля', 'error');
    }
  };

  // Сохранение email (с паролем) – заглушка
  const performEmailUpdate = async (newEmail: string, password: string) => {
    try {
      // Здесь будет реальный вызов userApi.updateUser или profileApi.updateProfile (когда добавят email)
      await updateEmailStub(newEmail, password);
      setOriginalEmail(newEmail);
      showFeedback('Email успешно обновлён', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Неверный пароль или ошибка обновления', 'error');
      throw error;
    }
  };

  const handleSave = () => {
    if (!canSave) return;
    if (!userId) return;

    const profileUpdate: any = {};
    if (firstName !== originalFirstName) profileUpdate.firstName = firstName;
    if (lastName !== originalLastName) profileUpdate.lastName = lastName;
    if (phone !== originalPhone) profileUpdate.phone = phone;

    // Если email не менялся – сохраняем только профиль
    if (email === originalEmail) {
      performProfileUpdate(profileUpdate);
      return;
    }

    // Если email изменился – запоминаем изменения профиля и открываем модалку
    setPendingProfileUpdate(profileUpdate);
    setIsPasswordModalOpen(true);
  };

  const confirmPassword = async (password: string) => {
    setIsPasswordModalOpen(false);
    setIsSaving(true);
    try {
      // 1. Обновляем email (с проверкой пароля)
      await performEmailUpdate(email, password);
      // 2. Обновляем остальные поля профиля (если есть)
      if (pendingProfileUpdate && Object.keys(pendingProfileUpdate).length > 0) {
        await updateProfileStub(pendingProfileUpdate);
        if (pendingProfileUpdate.firstName !== undefined) setOriginalFirstName(pendingProfileUpdate.firstName);
        if (pendingProfileUpdate.lastName !== undefined) setOriginalLastName(pendingProfileUpdate.lastName);
        if (pendingProfileUpdate.phone !== undefined) setOriginalPhone(pendingProfileUpdate.phone);
        showFeedback('Данные профиля обновлены', 'success');
      }
    } catch (error) {

    } finally {
      setIsSaving(false);
      setPendingProfileUpdate(null);
    }
  };

  return {
    name: firstName,
    setName: setFirstName,
    lastname: lastName,
    setLastname: setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    handleSave,
    isLoading: isLoading || isSaving,
    canSave,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    confirmPassword,
  };
}