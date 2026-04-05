import React, { JSX} from 'react';
import './ARForm.scss';

interface ARFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
}

export function ARForm({ children, onSubmit }: ARFormProps): JSX.Element {
  return (
    <form className="container_ar" autoComplete="off" onSubmit={onSubmit}>
      {children}
    </form>
  );
}