import { useState } from "react";
import "./Input.css";
import { Eye, ClosedEye } from "../../../../public/Eyes";

export function Input({ placeholder, type, maxlength, name, autoComplete }) {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";
  const inputType = isPasswordField
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="inputAR">
      <input
        type={inputType}
        placeholder={placeholder}
        maxLength={maxlength}
        name={name}
        className="inputAR"
        autoComplete={autoComplete}
      />

      {isPasswordField && (
        <button
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          type="button"
        >
          {showPassword ? (
            <ClosedEye size={25} color="#6b6b6b" />
          ) : (
            <Eye size={25} color="#6b6b6b" />
          )}
        </button>
      )}
    </div>
  );
}
