"use client";

import { supabase } from "@/lib/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NavBar() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace("/login");
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-surface/75 backdrop-blur-lg">
        <div className="mx-auto max-w-2xl px-5 h-16 flex items-center justify-between">
          {/* 로고 영역 */}
          <motion.div 
            whileHover={{ opacity: 0.8 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer select-none"
            onClick={() => router.push("/")}
          >
            <h1 className="text-[20px] font-black tracking-tighter text-text-primary flex items-center gap-1">
              <span className="text-primary">SSA</span>
              <span>TUDY</span>
            </h1>
          </motion.div>
          
          {/* 우측 메뉴 영역 */}
          <div className="flex items-center">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)} 
              /* 💡 포인트: 
                1. text-status-error (표준 문법) 사용
                2. rounded-[12px]로 곡률 명시 (TDS Medium 기준)
                3. overflow-hidden을 추가하여 배경색이 삐져나가지 않게 방지
              */
              className="text-[14px] font-bold text-(--status-error) px-4 py-2 rounded-[12px] hover:bg-(--status-error)/10 transition-all overflow-hidden"
            >
              로그아웃
            </motion.button>
          </div>
        </div>
      </nav>

      {/* --- 로그아웃 확인 모달 --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-5">
            {/* 배경 흐림 처리 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* 모달 콘텐츠 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-surface rounded-[28px] p-8 shadow-2xl text-center"
            >
              <h3 className="text-[20px] font-bold text-text-primary mb-2">로그아웃 하시겠어요?</h3>
              <p className="text-text-secondary text-[15px] mb-8 leading-relaxed">
                로그아웃하면 서비스 이용을 위해<br/>다시 로그인해야 합니다.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSignOut}
                  className="w-full h-[52px] bg-status-error text-white font-bold rounded-medium active:scale-[0.98] transition-all"
                >
                  로그아웃
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full h-[52px] bg-elevated text-text-secondary font-bold rounded-medium active:scale-[0.98] transition-all"
                >
                  그대로 있을게요
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}