import "./ModeName.scss";
import React, { JSX } from "react";

interface ModeNameProps {
  text: string;
}
export function ModeName({ text }: ModeNameProps): JSX.Element {
  return <h1 className="ModeName">{text}</h1>;
}
