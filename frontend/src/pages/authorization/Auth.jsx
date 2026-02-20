// src/pages/authorization/Auth.jsx
import "./Auth.css";
import { Name } from "../../components/auth_reg/Name/Name.jsx";
import { ARForm } from "../../components/auth_reg/ARForm/ARForm.jsx";
import { InputField } from "../../components/auth_reg/InputField/InputField.jsx";
import { ModeName } from "../../components/auth_reg/ModeName/ModeName.jsx";
import { ARButton } from "../../components/auth_reg/ARButton/ARButton.jsx";
import { AuthLink } from "../../components/auth_reg/AuthLink/AuthLink.jsx";
import { Lock } from "../../assets/lock.jsx";
import { Letter } from "../../assets/letter.jsx";
import { Input } from "../../components/auth_reg/Input/Input.jsx";
import { FieldSpacer } from "../../components/auth_reg/FieldSpacer/FieldSpacer.jsx";
import { useLogin } from "../../hooks/useLogin.js";

export function Auth() {
  const { email, setEmail, password, setPassword, handleLogin } = useLogin();

  return (
    <main>
      <Name />
      <ARForm>
        <ModeName text="Вход" />

        <FieldSpacer height={38} />

        <InputField>
          <Letter size={25} color="#6b6b6b" />
          <Input
            placeholder="Адрес электронной почты"
            type="text"
            maxlength={30}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </InputField>

        <FieldSpacer height={38} />

        <InputField>
          <Lock size={25} color="#6b6b6b" />
          <Input
            placeholder="Пароль"
            type="password"
            maxlength={28}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputField>

        <FieldSpacer height={38} />

        <ARButton text="Войти" onClick={handleLogin} />

        <AuthLink
          text="Нет аккаунта?"
          linkText="Регистрация"
          linkTo="/register"
        />
      </ARForm>
    </main>
  );
}
