import React from 'react';

export const Rouble = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M6 3h7a5 5 0 0 1 5 5 5 5 0 0 1-5 5H6" />
        <path d="M6 13h10" />
        <path d="M6 17h10" />
        <path d="M6 3v20" />
    </svg>
);
