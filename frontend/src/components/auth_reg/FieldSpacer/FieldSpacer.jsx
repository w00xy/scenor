import "./FieldSpacer.css";

export function FieldSpacer({ text, height }) {
  return <div className="field_spacer" style={{ height: height}}>{text}</div>;
}
