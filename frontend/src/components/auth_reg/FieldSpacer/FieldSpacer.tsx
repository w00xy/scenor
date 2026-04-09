import "./FieldSpacer.scss";
import { JSX } from "react/jsx-runtime";

interface FieldSpacerProps {
  text?: string;
  height: number;
}

export function FieldSpacer({ text, height }: FieldSpacerProps): JSX.Element {
  return (
    <div className="field_spacer" style={{ height }}>
      {text}
    </div>
  );
}
