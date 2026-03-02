/**
 * @id: COMPONENTS_COMMON_CARD_V2
 * @description: TDS(Toss Design System) 스타일의 기본 컨테이너
 * @last_modified: 2026-03-02
 */

"use client";

import * as React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string; // 추가적인 스타일 확장을 위해 허용
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div 
      className={`
        card
        w-full 
        max-w-md 
        p-8 
        /* 토스 표준 곡률: 24px */
        rounded-xl
        /* globals.css에 정의된 은은한 토스 그림자 */
        shadow-sm
        /* 배경(gray-50)과 구분을 위한 아주 연한 보더 */
        border-border
        /* 폰트 최적화 */
        font-sans 
        /* 카드 내부 패딩 */
        gap-4
        transition-all
        ${className}
      `}
    >
      {children}
    </div>
  );
}