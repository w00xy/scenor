import "./Auth.css";
import { Name } from "../../components/auth_reg/Name/Name.jsx";
import { ARForm } from "../../components/auth_reg/ARForm/ARForm.jsx";
import { InputField } from "../../components/auth_reg/InputField/InputField.jsx";
import { ModeName } from "../../components/auth_reg/ModeName/ModeName.jsx";
import { ARButton } from "../../components/auth_reg/ARButton/ARButton.jsx";
import { Lock } from "../../../public/lock.jsx";
import { Letter } from "../../../public/letter.jsx";
import { Input } from "../../components/auth_reg/Input/Input.jsx";
import { FieldFeedback } from "../../components/auth_reg/FieldFeedback/FieldFeedback.jsx";

export function Auth() {
  return (
    <main>
      <Name />
      <ARForm>
        <ModeName text="Вход" />
        <InputField>
          <Letter size={25} color="#6b6b6b" />
          <Input placeholder="Номер телефона / адрес электронной почты" type="text" maxlength={30} autoComplete="email" />
        </InputField>
        <FieldFeedback />
        <InputField>
          <Lock size={25} color="#6b6b6b" />
          <Input placeholder="Пароль" type="password" maxlength={28} autoComplete="new-password" />
        </InputField>
        <FieldFeedback />
        <ARButton text="Войти" />
      </ARForm>
    </main>
  );
}
