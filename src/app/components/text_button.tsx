/**
 * @id: COMPONENTS_COMMON_TEXT_LINK_BUTTON_V3
 * @description: globals.css 기반 스타일 및 Tailwind v4 변수 문법 적용 버전
 * @last_modified: 2026-03-02
 */

"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface TextLinkButtonProps {
  text: string;
  href: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export default function TextLinkButton({ 
  text, 
  href, 
  className = "",
  align = 'center'
}: TextLinkButtonProps) {
  const router = useRouter();

  // 정렬을 위한 컨테이너 클래스 매핑
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className={`flex ${alignmentClasses[align]} ${className}`}>
      <motion.button
        type="button"
        /**
         * .text-link-button: globals.css에 정의된 기본 레이아웃 및 호버 효과
         * text-(--text-secondary): Tailwind v4 변수 참조 문법
         */
        className={`
          text-link-button
          text-(--text-secondary)
          hover:text-(--text-primary)
          tracking-tight
          transition-colors
          duration-200
        `}
        onClick={() => router.push(href)}
        /* 클릭 시 토스 앱 특유의 살짝 눌리는 애니메이션 */
        whileTap={{ 
          scale: 0.97, 
          opacity: 0.8,
          transition: { duration: 0.1 } 
        }}
      >
        {text}
      </motion.button>
    </div>
  );
}