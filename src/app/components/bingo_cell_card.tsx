"use client";

import { BingoCell } from "@/lib/types";
import { motion } from "framer-motion";
import Image from "next/image";

interface BingoCellCardProps {
  cell: BingoCell;
  onClick?: (cell: BingoCell) => void;
  isReadOnly?: boolean; // 관리자 페이지 등에서 클릭 방지용
}

export default function BingoCellCard({ cell, onClick, isReadOnly = false }: BingoCellCardProps) {
  const isSubmitted = !!cell.submission;

  // 상태에 따른 스타일 및 라벨 정의
  const getCellState = () => {
    if (!cell.submission) {
      return { 
        label: "미진행", 
        style: "bg-gray-50 text-gray-400 border-gray-100", 
        isRejected: false 
      };
    }
    // 1순위: 반려 상태 확인
    if (cell.submission.rejection_reason) {
      return { 
        label: "반려됨", 
        style: "bg-red-50 text-red-600 border-red-200 shadow-red-100", 
        isRejected: true 
      };
    }
    // 2순위: 승인 여부 확인
    if (cell.submission.approved) {
      return { 
        label: "승인됨", 
        style: "bg-green-50 text-green-600 border-green-100", 
        isRejected: false 
      };
    }
    // 기본: 검토 중
    return { 
      label: "검토 중", 
      style: "bg-blue-50 text-blue-600 border-blue-100", 
      isRejected: false 
    };
  };

  const { label, style, isRejected } = getCellState();

  // 반려 시 흔들리는 애니메이션 설정
  const shakeAnimation = isRejected ? {
    x: [0, -2, 2, -2, 2, 0],
    transition: { repeat: Infinity, duration: 2, repeatDelay: 3 }
  } : {};

  return (
    <motion.button
      whileTap={isReadOnly ? {} : { scale: 0.95 }}
      animate={shakeAnimation}
      onClick={() => !isReadOnly && onClick?.(cell)}
      disabled={isReadOnly}
      className={`group relative aspect-square w-full overflow-hidden rounded-[24px] border shadow-sm transition-all ${
        isRejected ? "border-red-400 ring-2 ring-red-50" : "border-(--border)"
      } ${isReadOnly ? "cursor-default" : "cursor-pointer"} bg-white`}
    >
      {isSubmitted && cell.submission ? (
        <>
          <Image
            src={cell.submission.image_url_2 ?? cell.submission.image_url ?? ""}
            alt={cell.title}
            fill
            priority
            sizes="(max-width: 768px) 33vw, 250px"
            className={`object-cover transition-transform duration-500 group-hover:scale-110 ${isRejected ? "opacity-60 grayscale-[0.3]" : ""}`}
          />
          {/* 오버레이: 반려 시 더 붉은 톤으로 강조 */}
          <div className={`absolute inset-0 ${isRejected ? "bg-red-900/40" : "bg-black/40"}`} />
          
          {/* 반려 아이콘 표시 */}
          {isRejected && (
            <div className="absolute top-3 left-3 z-20 bg-red-600 text-white p-1 rounded-full shadow-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
              </svg>
            </div>
          )}

          <div className="relative z-10 flex h-full flex-col justify-end p-3 text-left">
            <span className={`mb-1.5 self-start rounded-full px-2 py-0.5 text-[9px] font-extrabold border shadow-sm ${style}`}>
              {label}
            </span>
            <p className="text-[12px] font-bold text-white line-clamp-2 leading-tight uppercase tracking-tighter drop-shadow-md">
              {cell.title}
            </p>
          </div>
        </>
      ) : (
        <div className={`flex h-full flex-col items-center justify-center p-3 text-center transition-colors ${isRejected ? "bg-red-50" : ""}`}>
          <span className="mb-2 text-[10px] font-bold text-(--text-tertiary)">
            #{cell.position + 1}
          </span>
          <p className={`mb-2 text-[12px] font-bold break-keep leading-snug ${isRejected ? "text-red-700" : "text-(--text-primary)"}`}>
            {cell.title}
          </p>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${style}`}>
            {label}
          </span>
        </div>
      )}
    </motion.button>
  );
}