import React, { JSX } from 'react';
import './ARButton.scss';

interface ARButtonProps {
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit';
}

export function ARButton({ text, onClick, type = 'submit' }: ARButtonProps): JSX.Element {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button className="btnAR" onClick={handleClick} type={type}>
      {text}
    </button>
  );
}