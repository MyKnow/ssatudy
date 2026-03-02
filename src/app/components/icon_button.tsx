/**
 * @id: COMPONENTS_COMMON_ICON_BUTTON_V2
 * @description: TDS 스타일의 세그먼트/옵션 선택 버튼
 * @last_modified: 2026-03-02
 */

"use client";

// animation
import { AnimatePresence, motion } from "framer-motion";

interface IconButtonProps {
  label: string;
  onClick: () => void;
  selected?: boolean;
  className?: string;
}

export default function IconButton({ 
  label, 
  onClick, 
  selected = false,
  className = ""
}: IconButtonProps) {
  return (
    <div className={`icon-button-wrapper inline-block ${className}`}>
      <motion.button
        type="button"
        /* globals.css의 .icon-button 스타일 기반 */
        className={`
          icon-button 
          relative
          overflow-hidden
          min-w-[80px]
          justify-center
          ${selected ? "selected border-primary text-primary" : "border-(--border) text-(--text-secondary)"}
        `}
        onClick={onClick}
        /* 클릭 시 쫀득한 피드백 (TDS 표준) */
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {/* 선택 시 나타나는 은은한 배경 애니메이션 (옵션) */}
        <AnimatePresence>
          {selected && (
            <motion.div
              layoutId="active-bg"
              className="absolute inset-0 bg-(--primary-light) -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        <span className="relative z-10 font-semibold tracking-tight">
          {label}
        </span>
      </motion.button>
    </div>
  );
}