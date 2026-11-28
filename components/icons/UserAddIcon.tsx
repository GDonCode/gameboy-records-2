import type { SVGProps } from 'react';

// New-user (sign in / create account) icon. Uses currentColor so it follows the surrounding text color.
export default function UserAddIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="175" cy="100" r="100" />
      <path d="M0 400V375A125 125 0 0 1 125 250H225A125 125 0 0 1 350 375V400Z" />
      <path d="M403 100H447V153H500V197H447V250H403V197H350V153H403Z" />
    </svg>
  );
}
