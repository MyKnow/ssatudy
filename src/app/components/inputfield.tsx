/**
 * @id: COMPONENTS_COMMON_INPUT_FIELD_V4
 * @description: 비밀번호 가시성 토글(Trailing Icon) 기능이 추가된 InputField
 * @last_modified: 2026-03-03
 */

"use client";

import * as React from "react";

type InputFieldProps = {
  label?: string;
  error?: string;
  type: string;
  name?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  className?: string;
  maxLength?: number;
  autoFocus?: boolean;
};

export default function InputField({ 
  label, 
  error, 
  type,
  className = "", 
  ...props 
}: InputFieldProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // 비밀번호 가시성 토글 핸들러
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // 실제 input에 전달될 타입 결정
  const inputType = type === "password" && showPassword ? "text" : type;

  // 스타일 결정 로직
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

      <div className="relative group">
        <input
          {...props}
          type={inputType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-4 rounded-medium
            bg-(--elevated) text-(--text-primary)
            placeholder:text-(--text-tertiary)
            border transition-all duration-200
            outline-none
            ${inputBorderColor}
            ${type === "password" ? "pr-12" : ""} // 아이콘 공간 확보
            shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]
          `}
        />

        {/* trailingIconButton: 비밀번호 타입일 때만 렌더링 */}
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            tabIndex={-1} // 탭 키 포커스 제외 (접근성 유지하면서 입력 흐름 방해 금지)
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full 
                       text-(--text-tertiary) hover:bg-gray-100 transition-colors"
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {showPassword ? (
              // 눈 감은 모양 (숨기기)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              // 눈 뜬 모양 (보기)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        )}
      </div>

      {error && (
        <span className="ml-1 text-[12px] text-(--status-error) font-medium">
          {error}
        </span>
      )}
    </div>
  );
}