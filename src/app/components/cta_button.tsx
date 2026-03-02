/**
 * @id: COMPONENTS_COMMON_CTA_BUTTON_V2
 * @description: TDS 스타일의 핵심 액션 버튼 (로딩 스피너 포함)
 * @last_modified: 2026-03-02
 */

"use client";

import React from "react";

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  fullWidth?: boolean;
}

export default function CTAButton({ 
  loading = false, 
  disabled = false, 
  fullWidth = true, // 기본적으로 토스 스타일은 가득 찬 버튼을 선호함
  children, 
  className = "",
  ...props 
}: CTAButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      /* globals.css의 .cta-button 스타일을 기본으로 사용 */
      className={`
        cta-button 
        ${fullWidth ? "w-full" : "w-auto"} 
        ${loading ? "opacity-90 cursor-wait" : ""} 
        ${className}
      `}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {/* 로딩 중일 때 텍스트를 숨기지 않고 투명하게 만들어 버튼 크기 유지 */}
        <span className={`${loading ? "opacity-0" : "opacity-100"} transition-opacity`}>
          {children}
        </span>

        {/* 로딩 스피너: 버튼 중앙에 절대 위치 */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-5 w-5 animate-spin text-white"
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
                className="opacity-100"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}