"use client";

import React from "react";

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function CTAButton({ loading = false, disabled = false, children, ...props }: CTAButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`cta-button ${loading ? "loading" : ""} ${props.className ?? ""}`}
    >
      {loading ? (
        <svg
          className="h-6 w-6 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}