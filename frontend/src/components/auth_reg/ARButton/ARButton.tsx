import React, { JSX } from "react";
import "./ARButton.scss";

interface ARButtonProps {
  text: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function ARButton({ text, onClick }: ARButtonProps): JSX.Element {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.(e);
  };

  return (
    <div
      className="btnAR"
      onClick={handleClick}
    >
      {text}
    </div>
  );
}