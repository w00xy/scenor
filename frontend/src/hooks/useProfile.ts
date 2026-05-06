import { useState, useEffect } from "react";
import { useFieldFeedbackContext } from "../context/FieldFeedbackContext";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";
import { profileApi, userApi } from "../services/api";

const cookies = new Cookies();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

type ProfileUpdateData = Partial<Pick<ProfileFormValues, "firstName" | "lastName" | "phone">>;

interface ApiError {
  message?: string;
  status?: number;
}

export function useProfile() {
  const { showFeedback } = useFieldFeedbackContext();
  const [userId, setUserId] = useState<string | null>(null);

  const [originalValues, setOriginalValues] = useState<ProfileFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [formValues, setFormValues] = useState<ProfileFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingProfileUpdate, setPendingProfileUpdate] =
    useState<ProfileUpdateData | null>(null);

  const setFirstName = (firstName: string) =>
    setFormValues((prev) => ({ ...prev, firstName }));
  const setLastName = (lastName: string) =>
    setFormValues((prev) => ({ ...prev, lastName }));
  const setEmail = (email: string) =>
    setFormValues((prev) => ({ ...prev, email }));
  const setPhone = (phone: string) =>
    setFormValues((prev) => ({ ...prev, phone }));

  const validateEmail = (email: string) => EMAIL_REGEX.test(email);
  const validatePhone = (phone: string) => !phone || PHONE_REGEX.test(phone);

  const hasChanges =
    formValues.firstName !== originalValues.firstName ||
    formValues.lastName !== originalValues.lastName ||
    formValues.email !== originalValues.email ||
    formValues.phone !== originalValues.phone;
  const isValid =
    validateEmail(formValues.email) && validatePhone(formValues.phone);
  const isBusy = isLoading || isSaving;
  const canSave = hasChanges && isValid && !isBusy && !!userId;

  const syncProfileFields = (firstName = "", lastName = "", phone = "") => {
    setOriginalValues((prev) => ({ ...prev, firstName, lastName, phone }));
    setFormValues((prev) => ({ ...prev, firstName, lastName, phone }));
  };

  const buildProfileUpdate = (): ProfileUpdateData => {
    const update: ProfileUpdateData = {};
    if (formValues.firstName !== originalValues.firstName) {
      update.firstName = formValues.firstName;
    }
    if (formValues.lastName !== originalValues.lastName) {
      update.lastName = formValues.lastName;
    }
    if (formValues.phone !== originalValues.phone) {
      update.phone = formValues.phone;
    }
    return update;
  };

  const applyProfileUpdate = async (profileUpdate: ProfileUpdateData) => {
    if (Object.keys(profileUpdate).length === 0) {
      return;
    }
    try {
      await profileApi.updateProfile(profileUpdate);
      setOriginalValues((prev) => ({ ...prev, ...profileUpdate }));
      showFeedback("Данные профиля обновлены", "success");
    } catch (error) {
      const apiError = error as ApiError;
      showFeedback(apiError.message || "Ошибка сохранения профиля", "error");
    }
  };

  const loadData = async (id: string) => {
    try {
      const profile = await profileApi.getProfile(id);
      syncProfileFields(
        profile.firstName || "",
        profile.lastName || "",
        profile.phone || "",
      );
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 404 || apiError.message?.includes("404")) {
        syncProfileFields("", "", "");
      } else {
        showFeedback(apiError.message || "Не удалось загрузить профиль", "error");
      }
    }

    try {
      const user = await userApi.getUser(id);
      setOriginalValues((prev) => ({ ...prev, email: user.email }));
      setFormValues((prev) => ({ ...prev, email: user.email }));
    } catch (error) {
      const apiError = error as ApiError;
      showFeedback(apiError.message || "Не удалось загрузить email", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = cookies.get("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode<{ sub: string }>(token);
      setUserId(decoded.sub);
      loadData(decoded.sub);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showFeedback("Ошибка загрузки профиля", "error");
      setIsLoading(false);
    }
  }, [showFeedback]);
     

  const handleSave = async () => {
    if (!canSave) return;
    if (!userId) return;

    const profileUpdate = buildProfileUpdate();

    if (formValues.email === originalValues.email) {
      setIsSaving(true);
      await applyProfileUpdate(profileUpdate);
      setIsSaving(false);
      return;
    }

    setPendingProfileUpdate(profileUpdate);
    setIsPasswordModalOpen(true);
  };

  const confirmPassword = async (password: string) => {
    if (!userId) {
      showFeedback("Пользователь не найден", "error");
      return;
    }

    setIsPasswordModalOpen(false);
    setIsSaving(true);
    try {
      await userApi.verifyPassword(password);
      await userApi.updateUser(userId, { email: formValues.email });
      setOriginalValues((prev) => ({ ...prev, email: formValues.email }));
      showFeedback("Email успешно обновлён", "success");

      if (pendingProfileUpdate) {
        await applyProfileUpdate(pendingProfileUpdate);
      }
    } catch (error) {
      const apiError = error as ApiError;
      showFeedback(apiError.message || "Неверный пароль или ошибка", "error");
    } finally {
      setIsSaving(false);
      setPendingProfileUpdate(null);
    }
  };
  return {
    firstName: formValues.firstName,
    setFirstName,
    lastName: formValues.lastName,
    setLastName,
    email: formValues.email,
    setEmail,
    phone: formValues.phone,
    setPhone,
    handleSave,
    isLoading: isBusy,
    canSave,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    confirmPassword,
  };
}
