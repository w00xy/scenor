import React, { JSX } from 'react';
import './ARButton.scss';
interface ARButtonProps {
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function ARButton({ text, onClick, type = 'submit', disabled = false }: ARButtonProps): JSX.Element {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onClick?.(e);
  };

  return (
    <button className="btnAR" onClick={handleClick} type={type} disabled={disabled}>
      {text}
    </button>
  );
}