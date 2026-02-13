// src/components/auth_reg/Input/Input.jsx
import { useState } from "react";
import "./Input.css";
import { Eye, ClosedEye } from "../../../assets/Eyes";

export function Input({ 
  placeholder, 
  type, 
  maxlength, 
  autoComplete,
  value,
  onChange 
}) {
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
        className="inputAR"
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
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