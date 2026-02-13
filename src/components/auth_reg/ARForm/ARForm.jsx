import "./ARForm.css";

export function ARForm({ children }) {
  return (
    <form className="container_ar" autoComplete="off">
      {children}
    </form>
  );
}
