import React, { JSX } from "react";
import "./InputField.scss";

interface InputFieldProps {
  children: React.ReactNode;
}

export function InputField({ children }: InputFieldProps): JSX.Element {
  return <div className="field">{children}</div>;
}
