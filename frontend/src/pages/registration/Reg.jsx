// src/pages/registration/Reg.jsx
import "./Reg.css";
import { Name } from "../../components/auth_reg/Name/Name.jsx";
import { ARForm } from "../../components/auth_reg/ARForm/ARForm.jsx";
import { InputField } from "../../components/auth_reg/InputField/InputField.jsx";
import { ModeName } from "../../components/auth_reg/ModeName/ModeName.jsx";
import { ARButton } from "../../components/auth_reg/ARButton/ARButton.jsx";
import { AuthLink } from "../../components/auth_reg/AuthLink/AuthLink.jsx";
import { Input } from "../../components/auth_reg/Input/Input.jsx";
import { FieldSpacer } from "../../components/auth_reg/FieldSpacer/FieldSpacer.jsx";
import { useRegister } from "../../hooks/useRegister";

import { User } from "../../assets/User.jsx";
import { Letter } from "../../assets/letter.jsx";
import { Lock } from "../../assets/lock.jsx";

export function Reg() {
  const {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    handleRegister
  } = useRegister();

  return (
    <main>
      <Name />
      <ARForm>
        <ModeName text="Регистрация" />

        <FieldSpacer height={24} />
        <InputField>
          <User size={25} color="#6b6b6b" />
          <Input
            placeholder="Имя пользователя"
            type="text"
            maxlength={30}
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </InputField>

        <FieldSpacer height={24} />
        <InputField>
          <Letter size={25} color="#6b6b6b" />
          <Input
            placeholder="Электронная почта"
            type="text"
            maxlength={50}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </InputField>

        <FieldSpacer height={24} />
        <InputField>
          <Lock size={25} color="#6b6b6b" />
          <Input
            placeholder="Пароль"
            type="password"
            maxlength={28}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputField>

        <FieldSpacer height={24} />
        <ARButton
          text="Зарегистрироваться"
          onClick={handleRegister}
        />
        <AuthLink text="Уже есть аккаунт?" linkText="Войти" linkTo="/auth" />
      </ARForm>
    </main>
  );
}