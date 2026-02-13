// src/components/auth_reg/ARButton/ARButton.jsx
import './ARButton.css'

export function ARButton({ text, onClick }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div 
      className='btnAR' 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      }}
    >
      {text}
    </div>
  )
}