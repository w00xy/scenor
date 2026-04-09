import { ChangeEvent } from "react";
import "./Input.scss";

interface InputProps {
  placeholder?: string;
  type?: "text" | "password" | "email" | "tel";
  maxlength?: number;
  autoComplete?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function Input({
  placeholder,
  type = "text",
  maxlength,
  autoComplete,
  value,
  onChange,
}: InputProps) {
  return (
    <div className="inputAR">
      <input
        type={type}
        placeholder={placeholder}
        maxLength={maxlength}
        className="inputAR"
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
