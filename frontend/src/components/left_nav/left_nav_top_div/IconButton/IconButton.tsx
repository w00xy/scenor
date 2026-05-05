import React, { JSX } from "react";
import "./IconButton.scss";
import { useNavigate } from "react-router-dom";

interface IconButtonProps {
  icon: React.ReactNode;
  to?: string;
  onClick?: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function IconButton({ icon, to, onClick, buttonRef }: IconButtonProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };
  return (
    <button
      ref={buttonRef}
      type="button"
      className="icon-button__top"
      onClick={handleClick}
    >
      {icon}
    </button>
  );
}
