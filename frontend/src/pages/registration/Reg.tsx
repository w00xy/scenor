import "./Reg.scss";
import { Content } from "../overview/Content/Content";
import { ARForm } from "../../components/auth_reg/ARForm/ARForm";
import { InputField } from "../../components/auth_reg/InputField/InputField";
import { ModeName } from "../../components/auth_reg/ModeName/ModeName";
import { ARButton } from "../../components/auth_reg/ARButton/ARButton";
import { Input } from "../../components/auth_reg/Input/Input";
import { FieldSpacer } from "../../components/auth_reg/FieldSpacer/FieldSpacer";
import { useRegister } from "../../hooks/useRegister";
import { AuthLink } from "../../components/auth_reg/AuthLink/AuthLink";
import { JSX } from "react";

export function Reg(): JSX.Element {
  const {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    handleRegister,
  } = useRegister();

  const onSubmit = async (e: React.FormEvent) => {
    await handleRegister(e);
  };

  return (
    <div className="auth-page">
      <div className="auth-page__blur">
        <Content />
      </div>
      <div className="auth-page__form">
        <ARForm onSubmit={onSubmit}>
          <ModeName text="Регистрация" />
          <FieldSpacer height={24} />
          <InputField>
            <Input
              placeholder="Имя пользователя"
              type="text"
              maxlength={30}
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </InputField>
          <FieldSpacer height={16} />
          <InputField>
            <Input
              placeholder="Электронная почта"
              type="text"
              maxlength={50}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </InputField>
          <FieldSpacer height={16} />
          <InputField>
            <Input
              placeholder="Пароль"
              type="password"
              maxlength={28}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputField>
          <FieldSpacer height={16} />
          <ARButton text="Зарегистрироваться" type="submit" />
          <FieldSpacer height={12} />
          <AuthLink
            text="Уже есть аккаунт?"
            linkText="Войти"
            linkTo="/auth"
          />
        </ARForm>
      </div>
    </div>
  );
}