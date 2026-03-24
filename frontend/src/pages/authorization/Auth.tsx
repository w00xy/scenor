import "./Auth.scss";
import { ARForm } from "../../components/auth_reg/ARForm/ARForm";
import { InputField } from "../../components/auth_reg/InputField/InputField";
import { ModeName } from "../../components/auth_reg/ModeName/ModeName";
import { ARButton } from "../../components/auth_reg/ARButton/ARButton";
import { AuthLink } from "../../components/auth_reg/AuthLink/AuthLink";
import { Input } from "../../components/auth_reg/Input/Input";
import { FieldSpacer } from "../../components/auth_reg/FieldSpacer/FieldSpacer";
import { useLogin } from "../../hooks/useLogin";
import React, { ChangeEvent } from "react";
import {JSX} from "react";

export function Auth(): JSX.Element {
  const { email, setEmail, password, setPassword, handleLogin } = useLogin();

  return (
    <main>
      <ARForm>
        <ModeName text="Авторизация" />

        <FieldSpacer height={32} />

        <InputField>
          <Input
            placeholder="Адрес электронной почты"
            type="text"
            maxlength={30}
            autoComplete="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
        </InputField>

        <FieldSpacer height={16} />

        <InputField>
          <Input
            placeholder="Пароль"
            type="password"
            maxlength={28}
            autoComplete="current-password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
        </InputField>

        <FieldSpacer height={16} />

        <ARButton text="Вход" onClick={handleLogin} />
        <FieldSpacer height={12} />
        <AuthLink
          text="Ещё нет аккаунта?"
          linkText="Зарегистрироваться"
          linkTo="/register"
        />
      </ARForm>
    </main>
  );
}