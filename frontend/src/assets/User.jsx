export function User({ size, color }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="8" r="2" />
      <path d="M5 17 Q12 14, 19 17" />
    </svg>
  );
}