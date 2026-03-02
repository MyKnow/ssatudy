/**
 * @id: PAGES_DASHBOARD_V5
 * @description: 본인(나)이 최상단에 고정된 팀 리스트 및 디스코드 버튼 대시보드
 * @last_modified: 2026-03-02
 */

"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Card from "./components/card";

type TeamMember = { id: number; name: string; class: number; isMe?: boolean };
type BingoCell = {
  id: number;
  title: string;
  content: string;
  state: "미진행" | "인증 중" | "승인됨" | "반려됨";
};

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [bingoCells, setBingoCells] = useState<BingoCell[]>([]);

  // 로그아웃 핸들러
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // 세션 삭제 후 로그인 페이지로 즉시 리다이렉트
    router.replace("/login");
  };

  useEffect(() => {
    const checkSessionAndTeam = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      } else {
        // 본인 데이터를 포함한 팀원 리스트 구성
        const myData: TeamMember = { id: 0, name: "정민호", class: 11, isMe: true };
        const others: TeamMember[] = [
          { id: 1, name: "홍길동", class: 11 },
          { id: 2, name: "김철수", class: 12 },
          { id: 3, name: "이영희", class: 13 },
          { id: 4, name: "박철민", class: 14 },
          { id: 5, name: "최유리", class: 15 },
        ];
        
        setTeamMembers([myData, ...others]);
        
        setBingoCells([
          { id: 1, title: "기상 인증", content: "8시 기상", state: "미진행" },
          { id: 2, title: "알고리즘", content: "백준 1문제", state: "인증 중" },
          { id: 3, title: "TIL 작성", content: "블로그 정리", state: "승인됨" },
          { id: 4, title: "운동", content: "30분 산책", state: "반려됨" },
          { id: 5, title: "독서", content: "10p 읽기", state: "미진행" },
          { id: 6, title: "코드 리뷰", content: "PR 리뷰", state: "인증 중" },
          { id: 7, title: "영어 공부", content: "단어 20개", state: "승인됨" },
          { id: 8, title: "커밋", content: "1일 1커밋", state: "반려됨" },
          { id: 9, title: "명상", content: "5분 명상", state: "미진행" },
        ]);
        setLoading(false);
      }
    };
    checkSessionAndTeam();
  }, [router]);

  const getBadgeClass = (state: BingoCell["state"]) => {
    const styles = {
      "미진행": "bg-(--background) text-(--text-tertiary) border border-(--border)",
      "인증 중": "bg-(--primary-light) text-(--primary) border border-(--primary-light)",
      "승인됨": "bg-green-50 text-green-600 border border-green-100",
      "반려됨": "bg-red-50 text-(--status-error) border border-red-100",
    };
    return styles[state] || styles["미진행"];
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-(--background)">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--primary-light) border-t-(--primary)" />
    </div>
  );

  return (
    <div className="min-h-screen bg-(--background) pb-10">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 px-5 py-4 backdrop-blur-md border-b border-(--border)">
        <h1 className="text-xl font-extrabold tracking-tighter text-(--text-primary)">SSAFY <span className="text-(--primary)">BINGO</span></h1>
        <button onClick={handleSignOut} className="text-sm font-semibold text-(--text-tertiary) hover:text-(--status-error) transition-colors">로그아웃</button>
      </header>

      <main className="mx-auto max-w-2xl p-5 space-y-8">
        {/* 우리 팀 섹션 */}
        <section className="space-y-3">
          <h2 className="px-1 text-[15px] font-bold text-(--text-secondary)">우리 팀</h2>
          <div className="flex gap-4">
            {/* 좌측: 팀 멤버 리스트 (나 포함 총 6명) */}
            <Card className="flex-1 p-0! overflow-hidden shadow-sm pointer-events-none">
              <div className="flex flex-col divide-y divide-(--border)">
                {teamMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className={`flex items-center gap-3 px-4 py-3 ${member.isMe ? 'bg-(--primary-light)/30' : 'bg-white'}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${member.isMe ? 'bg-(--primary) text-white' : 'bg-(--primary-light) text-(--primary)'}`}>
                      {member.name[0]}
                    </div>
                    <div className="flex items-baseline gap-1 truncate">
                      <span className="text-[14px] font-bold text-(--text-primary)">
                        {member.name}{member.isMe && "(나)"}
                      </span>
                      <span className="text-[12px] text-(--text-tertiary)">
                        {member.class}반
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 우측: 디스코드 버튼 (동일 높이 유지) */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => window.open('https://discord.com', '_blank')}
              className="w-36 sm:w-44 flex flex-col items-center justify-center gap-3 rounded-[24px] bg-[#5865F2] text-white shadow-lg hover:bg-[#4752C4] transition-colors"
            >
              <div className="p-3 bg-white/20 rounded-full">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.579.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/></svg>
              </div>
              <span className="font-bold text-sm tracking-tight">팀 채팅방</span>
            </motion.button>
          </div>
        </section>

        {/* 빙고 현황 섹션 */}
        <section className="space-y-3">
          <h2 className="px-1 text-[15px] font-bold text-(--text-secondary)">우리 팀 빙고 현황</h2>
          <div className="grid grid-cols-3 gap-3">
            {bingoCells.map((cell) => {
              const isStarted = cell.state !== "미진행";
              return (
                <motion.button
                  key={cell.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/bingo/${cell.id}`)}
                  className="group relative aspect-square w-full overflow-hidden rounded-[24px] border border-(--border) shadow-sm bg-white"
                >
                  {isStarted ? (
                    <>
                      <img 
                        src={`https://picsum.photos/seed/${cell.id}/400`} 
                        alt={cell.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="relative z-10 flex h-full flex-col justify-end p-3 text-left">
                        <span className={`mb-1.5 self-start rounded-full px-2 py-0.5 text-[9px] font-bold ${getBadgeClass(cell.state)}`}>
                          {cell.state}
                        </span>
                        <p className="text-[13px] font-bold text-white line-clamp-2 leading-tight uppercase tracking-tight">{cell.title}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-3 text-center">
                      <span className="mb-2 text-[10px] font-bold text-(--text-tertiary)">#{cell.id}</span>
                      <p className="mb-2 text-[13px] font-bold text-(--text-primary) break-keep">{cell.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${getBadgeClass(cell.state)}`}>
                        미진행
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}