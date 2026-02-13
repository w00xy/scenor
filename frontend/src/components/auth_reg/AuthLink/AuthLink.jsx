import { Link } from 'react-router-dom';
import './AuthLink.css';

export function AuthLink({ text, linkText, linkTo }) {
  return (
    <div className="auth-link">
      <span className="auth-link-text">{text}</span>
      <Link to={linkTo} className="auth-link-link">
        {linkText}
      </Link>
    </div>
  );
}