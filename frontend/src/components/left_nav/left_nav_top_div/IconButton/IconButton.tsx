import React, { JSX } from "react";
import "./IconButton.scss";
import { useNavigate } from "react-router-dom";

interface IconButtonProps {
  icon: React.ReactNode;
  to?: string; // опциональный
  onClick?: () => void; // опциональный
}

export function IconButton({ icon, to, onClick }: IconButtonProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };
  return (
    <button className="icon-button__top" onClick={handleClick}>
      {icon}
    </button>
  );
}
