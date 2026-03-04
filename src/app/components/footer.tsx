"use client";

import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="mx-auto max-w-2xl w-full px-6 py-12 mt-10 border-t border-(--border)">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-sm font-black text-(--text-primary) tracking-tighter italic">
              SSATUDY v1.0
            </h2>
            <p className="text-[12px] text-(--text-tertiary) font-medium leading-relaxed">
              본 서비스는 SSAFY 교육생들의 원활한 <br />
              네트워킹과 몰입을 위해 제작되었습니다.
            </p>
          </div>

          {/* 관리자 버튼: 다크모드 대응을 위해 bg-gray-50 대신 var(--elevated) 사용 */}
          <button
            onClick={() => router.push("/admin")}
            className="p-2 bg-(--elevated) rounded-xl text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
            title="관리자 페이지"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>

        {/* 주요 링크 섹션 */}
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          <a
            href="https://github.com/MyKnow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-black text-(--text-tertiary) hover:text-(--text-primary) transition-colors uppercase tracking-widest"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            Github
          </a>

          <a
            href="mailto:myknow00@naver.com"
            className="flex items-center gap-1.5 text-[11px] font-black text-(--text-tertiary) hover:text-(--text-primary) transition-colors uppercase tracking-widest"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Email
          </a>

          <a
            href="#"
            className="flex items-center gap-1.5 text-[11px] font-black text-(--status-error) opacity-70 hover:opacity-100 transition-opacity uppercase tracking-widest"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13l3 3m0-3l-3 3m-10-6l-3-3m3 3l-3 3M8 11a4 4 0 1 1 8 0 4 4 0 1 1-8 0m1-5v-1m6 1v-1m-7 11v1m6-1v1" />
            </svg>
            Bug Report
          </a>
        </div>

        <p className="text-[10px] font-medium text-(--text-tertiary) opacity-50 uppercase tracking-widest mt-2">
          © 2026 MYKNOW. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}