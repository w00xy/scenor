import React, { JSX, use } from "react";
import "./MMTS_div_one.scss";
import { useNavigate } from "react-router-dom";

interface MMTS_div_oneProps{
    text: string;
}

export function MMTS_div_one({ text }: MMTS_div_oneProps): JSX.Element {
  const navigate = useNavigate();
  const handleClick = () => navigate('/home');
  return (
    <div className="MMTS_div_one">
      <div className="MMTS_div_one_txt">
        <p className="a1">Обзор</p>
        <p>Все сценарии, учетные данные и таблицы данных, к которым у вас есть доступ.</p>
      </div>
      <button className="module_call" onClick={handleClick}>{text}</button>
    </div>
  );
}
