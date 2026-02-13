// src/pages/authorization/Auth.jsx
import "./Auth.css";
import { Name } from "../../components/auth_reg/Name/Name.jsx";
import { ARForm } from "../../components/auth_reg/ARForm/ARForm.jsx";
import { InputField } from "../../components/auth_reg/InputField/InputField.jsx";
import { ModeName } from "../../components/auth_reg/ModeName/ModeName.jsx";
import { ARButton } from "../../components/auth_reg/ARButton/ARButton.jsx";
import { Lock } from "../../assets/lock.jsx";
import { Letter } from "../../assets/letter.jsx";
import { Input } from "../../components/auth_reg/Input/Input.jsx";
import { FieldSpacer } from "../../components/auth_reg/FieldSpacer/FieldSpacer.jsx";
import { useAuth } from "../../hooks/useAuth";

export function Auth() {
  const { 
    email, 
    setEmail, 
    password, 
    setPassword, 
    handleLogin, 
  } = useAuth();

  return (
    <main>
      <Name />
      <ARForm>
        <ModeName text="Вход" />
        
        <FieldSpacer />

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
        
        <FieldSpacer />
        
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
        
        <FieldSpacer />
        
        {/* Основная кнопка входа */}
        <ARButton text="Войти" onClick={handleLogin} />
      </ARForm>
    </main>
  );
}