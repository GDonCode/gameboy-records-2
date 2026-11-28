import type { SVGProps } from 'react';

// Logged-in account icon. Uses currentColor so it follows the surrounding text color.
export default function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 400" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="175" cy="100" r="100" />
      <path d="M125 250H225A125 125 0 0 1 350 375V400H0V375A125 125 0 0 1 125 250Z" />
    </svg>
  );
}
