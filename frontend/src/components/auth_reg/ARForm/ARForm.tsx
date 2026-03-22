import React, { JSX } from "react";
import './ARForm.scss';

interface ARFormProps {
  children: React.ReactNode;
}

export function ARForm({ children }: ARFormProps): JSX.Element {
  const style: React.CSSProperties = {};

  return (
    <form className="container_ar" autoComplete="off">
      {children}
    </form>
  );
}