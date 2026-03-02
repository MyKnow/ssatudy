/**
 * @id: COMPONENTS_COMMON_SEGMENT_BUTTON_GROUP_V6
 * @description: globals.css 스타일 기반 통합 및 프레이머 모션 슬라이딩 적용
 */

"use client";

import { motion } from "framer-motion";

interface Option {
  value: string;
  label: string;
}

interface SegmentButtonGroupProps {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
  label: string;
  className?: string;
}

export default function SegmentButtonGroup({ 
  options, 
  selected, 
  onSelect, 
  label,
  className = ""
}: SegmentButtonGroupProps) {
  
  // 그룹 간 애니메이션 간섭 방지를 위한 고유 ID
  const safeLabel = label ? label.replace(/\s+/g, '-').toLowerCase() : 'segment';
  const layoutGroupId = `${safeLabel}-group`;

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* globals.css의 .label-text 스타일 적용 */}
      {label && <label className="label-text">{label}</label>}

      {/* globals.css의 .segment-container 스타일 적용 */}
      <div className="segment-container relative">
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              /* globals.css의 .segment-item 스타일 + 선택 상태 분기 */
              className={`segment-item relative z-10 ${isSelected ? "text-primary" : ""}`}
              style={{ flex: 1 }} // 균등 분할 유지
            >
              {/* 배경 슬라이딩 애니메이션 */}
              {isSelected && (
                <motion.div
                  layoutId={layoutGroupId}
                  className="absolute inset-0 bg-white shadow-sm border border-(--border) opacity-100"
                  style={{ 
                    borderRadius: "10px",
                    zIndex: -1 
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="pointer-events-none">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}