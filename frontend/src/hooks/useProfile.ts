import { useState, useEffect } from "react";
import { useFieldFeedbackContext } from "../context/FieldFeedbackContext";
import Cookies from "universal-cookie";
import { profileApi, userApi } from "../services/api";
import { jwtDecode } from "jwt-decode";

const cookies = new Cookies();

interface JwtPayload {
  sub: string;
  email?: string;
}

export function useProfile() {
  const { showFeedback } = useFieldFeedbackContext();
  const [userId, setUserId] = useState<string | null>(null);

  const [originalFirstName, setOriginalFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) =>
    !phone || /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone);

  const hasChanges = () =>
    firstName !== originalFirstName ||
    lastName !== originalLastName ||
    email !== originalEmail ||
    phone !== originalPhone;

  const isValid = () => validateEmail(email) && validatePhone(phone);
  const canSave = hasChanges() && isValid();

  useEffect(() => {
    const token = cookies.get("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUserId(decoded.sub);
        loadData(decoded.sub);
      } catch (error) {
        console.error("Ошибка декодирования токена", error);
        showFeedback("Ошибка загрузки профиля", "error");
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadData = async (id: string) => {
    try {
      const profile = await profileApi.getProfile(id);
      setOriginalFirstName(profile.firstName || "");
      setOriginalLastName(profile.lastName || "");
      setOriginalPhone(profile.phone || "");
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setPhone(profile.phone || "");
    } catch (error: any) {
      if (error.status === 404 || error.message?.includes("404")) {
        setOriginalFirstName("");
        setOriginalLastName("");
        setOriginalPhone("");
        setFirstName("");
        setLastName("");
        setPhone("");
      }
    }

    try {
      const user = await userApi.getUser(id);
      setOriginalEmail(user.email);
      setEmail(user.email);
    } catch (error: any) {
      console.error(error);
      showFeedback(error.message || "Не удалось загрузить email", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!canSave) return;
    if (!userId) return;

    const profileUpdate: any = {};
    if (firstName !== originalFirstName) profileUpdate.firstName = firstName;
    if (lastName !== originalLastName) profileUpdate.lastName = lastName;
    if (phone !== originalPhone) profileUpdate.phone = phone;

    const emailUpdate: any = {};
    if (email !== originalEmail) emailUpdate.email = email;

    try {
      if (Object.keys(profileUpdate).length > 0) {
        await profileApi.updateProfile(userId, profileUpdate);
      }
      if (Object.keys(emailUpdate).length > 0) {
        await userApi.updateUser(userId, emailUpdate);
      }
      setOriginalFirstName(firstName);
      setOriginalLastName(lastName);
      setOriginalEmail(email);
      setOriginalPhone(phone);
      showFeedback("Данные успешно обновлены", "success");
    } catch (error: any) {
      console.error(error);
      showFeedback(error.message || "Ошибка сохранения", "error");
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
    isLoading,
    canSave,
  };
}
