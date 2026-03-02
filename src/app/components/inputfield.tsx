/**
 * @id: COMPONENTS_COMMON_INPUT_FIELD_V3
 * @description: globals.css 변수를 직접 참조하여 Focus 및 Error 색상 수정
 */

"use client";

import * as React from "react";

type InputFieldProps = {
  label?: string;
  error?: string;
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  className?: string;
  maxLength?: number;
};

export default function InputField({ 
  label, 
  error, 
  className = "", 
  ...props 
}: InputFieldProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  // CSS 변수 직접 참조를 위한 스타일 클래스 정의
  const labelColor = error 
    ? "text-[var(--status-error)]" 
    : isFocused 
      ? "text-[var(--primary)]" 
      : "text-[var(--text-secondary)]";
  
  const inputBorderColor = error 
    ? "border-[var(--status-error)] ring-1 ring-[var(--status-error)]" 
    : isFocused 
      ? "border-[var(--primary)] ring-1 ring-[var(--primary)]" 
      : "border-transparent";

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label 
          className={`
            ml-1 text-[13px] font-medium transition-colors duration-200
            ${labelColor}
          `}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          maxLength={props.maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-4 rounded-medium
            bg-(--elevated) text-(--text-primary)
            placeholder:text-(--text-tertiary)
            border transition-all duration-200
            outline-none
            ${inputBorderColor}
            shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]
          `}
        />
      </div>

      {error && (
        <span className="ml-1 text-[12px] text-(--status-error) font-medium">
          {error}
        </span>
      )}
    </div>
  );
}