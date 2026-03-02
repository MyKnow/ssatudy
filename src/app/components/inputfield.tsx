"use client";
import * as React from "react";

type InputFieldProps = {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
};

export default function InputField(props: InputFieldProps) {
  return (
    <input
      {...props}
      className={`
        w-full px-4 py-3 rounded-2xl
        bg-surface text-textPrimary
        placeholder:text-textSecondary
        transition-shadow shadow-sm font-sans
      `}
    />
  );
}