import { Link } from 'react-router-dom';
import './AuthLink.scss';
import { JSX } from 'react/jsx-runtime';

interface AuthLinkProps {
  text: string;
  linkText: string;
  linkTo: string;
}

export function AuthLink({ text, linkText, linkTo }: AuthLinkProps): JSX.Element {
  return (
    <div className="auth-link">
      <span className="auth-link-text">{text}</span>
      <Link to={linkTo} className="auth-link-link">
        {linkText}
      </Link>
    </div>
  );
}