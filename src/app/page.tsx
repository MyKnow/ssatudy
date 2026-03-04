"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import BingoCellCard from "./components/bingo_cell_card";
import Card from "./components/card";

// src/lib/types.ts에서 정의한 타입 사용
import {
  BingoCell,
  BingoResponse,
  User,
  UserWithTeam,
} from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserWithTeam | null>(null);
  const [teamMembers, setTeamMembers] = useState<(User & { isMe?: boolean })[]>([]);
  const [bingoCells, setBingoCells] = useState<BingoCell[]>([]);

  // 1. 로그아웃 함수 정의
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      // [Fetch 1] 유저 및 팀 정보 (discord_channel_id 포함)
      const { data: userRaw, error: userError } = await supabase
        .from("users")
        .select("*, teams(id, name, discord_channel_id)")
        .eq("id", session.user.id)
        .single();

      if (userError || !userRaw?.team_id) {
        setUserData(null);
        setLoading(false);
        return;
      }

      const typedUser = userRaw as unknown as UserWithTeam;
      setUserData(typedUser);

      const { data: members } = await supabase
        .from("users")
        .select("*")
        .eq("team_id", typedUser.team_id);

      if (members) {
        const sortedMembers = (members as User[]).map(m => ({
          ...m,
          isMe: m.id === session.user.id // 현재 로그인한 ID와 비교
        })).sort((a, b) => {
          // 1. '나'를 최우선으로 (isMe가 true면 앞으로)
          if (a.isMe) return -1;
          if (b.isMe) return 1;

          // 2. 나머지는 이름(name) 가나다순으로 정렬
          return a.name.localeCompare(b.name, 'ko');
        });

        setTeamMembers(sortedMembers);
      }

      // [Fetch 3] 빙고 셀 정보 수정
      const { data: cells, error: bingoError } = await supabase
        .from("bingo_cells")
        .select(`
          id, 
          position, 
          title, 
          type, 
          team_id, 
          required_count,
          submission:submissions ( 
            id, 
            image_url, 
            image_url_2, 
            approved,
            rejection_reason
          )
        `)
        .eq("team_id", typedUser.team_id)
        .order("position", { ascending: true });
        
      if (bingoError) {
        console.error("빙고 로딩 에러:", bingoError.message);
        setLoading(false);
        return;
      }

      if (cells) {
        const formattedCells: BingoCell[] = (cells as BingoResponse[]).map(cell => ({
          id: cell.id,
          position: cell.position,
          title: cell.title,
          type: cell.type,
          team_id: cell.team_id,
          required_count: cell.required_count,
          // 중요: submissions는 외래키 관계상 배열로 넘어옵니다.
          submission: cell.submission && cell.submission.length > 0 
            ? cell.submission[0] 
            : null
        }));
        setBingoCells(formattedCells);
      } else {
        console.warn("데이터는 성공했으나 결과가 비어있음 (팀 ID 확인 필요)");
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-(--background)">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--primary-light) border-t-(--primary)" />
    </div>
  );

  // 에러 해결: myTeamId 대신 userData?.team_id 사용
  if (!userData?.team_id) return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-(--background) p-10 text-center">
      <div className="mb-6 p-6 bg-white rounded-[40px] shadow-sm border border-(--border)">
        <span className="text-4xl text-black">🏝️</span>
      </div>
      <h2 className="text-2xl font-bold text-(--text-primary) mb-2 tracking-tight">아직 소속된 팀이 없어요</h2>
      <p className="text-(--text-secondary) leading-relaxed mb-8 text-[15px]">
        팀 배정이 완료되면 빙고판이 활성화됩니다.<br/>잠시만 기다려 주세요!
      </p>
      <button onClick={handleSignOut} className="text-sm font-bold text-(--text-tertiary) underline">로그아웃</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-(--background) pb-10">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 px-5 py-4 backdrop-blur-md border-b border-(--border)">
        <h1 className="text-xl font-extrabold tracking-tighter text-(--text-primary)">
          SSAFY <span className="text-(--primary)">BINGO</span>
        </h1>
        <button onClick={handleSignOut} className="text-sm font-semibold text-(--text-tertiary) hover:text-(--status-error) transition-colors">로그아웃</button>
      </header>

      <main className="mx-auto max-w-2xl p-5 space-y-8">
        <section className="space-y-3">
          <h2 className="px-1 text-[15px] font-bold text-(--text-secondary)">우리 팀: {userData.teams?.name}</h2>
          <div className="flex gap-4">
            <Card className="flex-1 p-0! overflow-hidden shadow-sm">
              <div className="flex flex-col divide-y divide-(--border)">
                {teamMembers.map((member) => (
                  <div key={member.id} className={`flex items-center gap-3 px-4 py-3 ${member.isMe ? 'bg-(--primary-light)/30' : 'bg-white'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${member.isMe ? 'bg-(--primary) text-white' : 'bg-(--primary-light) text-(--primary)'}`}>
                      {member.name[0]}
                    </div>
                    <div className="flex items-baseline gap-1 truncate">
                      <span className="text-[14px] font-bold text-(--text-primary)">{member.name}{member.isMe && " (나)"}</span>
                      <span className="text-[12px] text-(--text-tertiary)">{member.class}반</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <motion.button
              whileTap={{ scale: 0.97 }}
              // 에러 해결: discordId 대신 userData.teams?.discord_channel_id 사용
              onClick={() => window.open(`https://discord.com/channels/${userData.teams?.discord_channel_id || ''}`, '_blank')}
              className="w-32 sm:w-40 flex flex-col items-center justify-center gap-3 rounded-[24px] bg-[#5865F2] text-white shadow-lg hover:bg-[#4752C4]"
            >
              <div className="p-3 bg-white/20 rounded-full text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.579.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
              </div>
              <span className="font-bold text-xs">팀 채팅방</span>
            </motion.button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="px-1 text-[15px] font-bold text-(--text-secondary)">우리 팀 빙고 현황</h2>
            <div className="grid grid-cols-3 gap-3">
              {bingoCells.map((cell) => (
                <BingoCellCard 
                  key={cell.id} 
                  cell={cell} 
                  onClick={(c) => router.push(`/bingo/${c.id}`)}
                />
              ))}
            </div>
        </section>
      </main>

      {/* --- Footer 추가 시작 --- */}
      <footer className="mx-auto max-w-2xl w-full px-6 py-12 mt-10 border-t border-(--border)">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-(--text-primary) tracking-tighter italic">SSAFY BINGO v1.0</h2>
              <p className="text-[12px] text-(--text-tertiary) font-medium leading-relaxed">
                본 서비스는 SSAFY 교육생들의 원활한 <br />
                네트워킹과 몰입을 위해 제작되었습니다.
              </p>
            </div>
            
            <button 
              onClick={() => router.push('/admin')}
              className="p-2 bg-gray-50 rounded-xl text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
              title="관리자 페이지"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>

          {/* 주요 링크 섹션 (Github, Mail, Bug Report) */}
          <div className="flex flex-wrap gap-x-4 gap-y-3">
            {/* GitHub */}
            <a 
              href="https://github.com/MyKnow" // 본인 깃허브 주소로 변경
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-black text-(--text-tertiary) hover:text-(--text-primary) transition-colors uppercase tracking-widest"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              Github
            </a>

            {/* Email */}
            <a 
              href="mailto:myknow00@naver.com" // 본인 이메일로 변경
              className="flex items-center gap-1.5 text-[11px] font-black text-(--text-tertiary) hover:text-(--text-primary) transition-colors uppercase tracking-widest"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Email
            </a>

            {/* Bug Report */}
            <a 
              href="#" // 버그 제보 링크 (구글 폼이나 이슈 레이즈 등)
              className="flex items-center gap-1.5 text-[11px] font-black text-(--status-error) opacity-70 hover:opacity-100 transition-opacity uppercase tracking-widest"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13l3 3m0-3l-3 3m-10-6l-3-3m3 3l-3 3M8 11a4 4 0 1 1 8 0 4 4 0 1 1-8 0m1-5v-1m6 1v-1m-7 11v1m6-1v1"/></svg>
              Bug Report
            </a>
          </div>

          <p className="text-[10px] font-medium text-gray-300 uppercase tracking-widest mt-2">
            © 2026 MYKNOW. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}