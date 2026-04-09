import "./Auth.scss";
import { ARForm } from "../../components/auth_reg/ARForm/ARForm";
import { InputField } from "../../components/auth_reg/InputField/InputField";
import { ModeName } from "../../components/auth_reg/ModeName/ModeName";
import { ARButton } from "../../components/auth_reg/ARButton/ARButton";
import { Input } from "../../components/auth_reg/Input/Input";
import { FieldSpacer } from "../../components/auth_reg/FieldSpacer/FieldSpacer";
import { useLogin } from "../../hooks/useLogin";
import { AuthLink } from "../../components/auth_reg/AuthLink/AuthLink";
import React, { ChangeEvent } from "react";
import { Content } from "../overview/Content/Content";
import { JSX } from "react";

export function Auth(): JSX.Element {
  const { email, setEmail, password, setPassword, handleLogin } = useLogin();

  const onSubmit = async (e: React.FormEvent) => {
    await handleLogin(e);
  };

  return (
    <div className="auth-page">
      <div className="auth-page__blur">
        <Content />
      </div>
      <div className="auth-page__form">
        <ARForm onSubmit={onSubmit}>
        <ModeName text="Авторизация" />
        <FieldSpacer height={32} />
        <InputField>
          <Input
            placeholder="Адрес электронной почты"
            type="text"
            maxlength={30}
            autoComplete="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
        </InputField>
        <FieldSpacer height={16} />
        <InputField>
          <Input
            placeholder="Пароль"
            type="password"
            maxlength={28}
            autoComplete="current-password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
        </InputField>
        <FieldSpacer height={16} />
        <ARButton text="Вход" type="submit" />
        <FieldSpacer height={12} />
        <AuthLink
          text="Ещё нет аккаунта?"
          linkText="Зарегистрироваться"
          linkTo="/register" />
      </ARForm>
      </div>
    </div>
  );
}
