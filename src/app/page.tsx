/**
 * @id: PAGES_DASHBOARD_V6_FIXED
 * @description: ESLint 에러 해결 및 Next.js Image 최적화가 적용된 실데이터 연동 버전
 * @last_modified: 2026-03-03
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Card from "./components/card";

// --- Types & Interfaces ---

interface TeamMember {
  id: string;
  name: string;
  class: string;
  student_id: string;
  isMe?: boolean;
}

interface Submission {
  id: string;
  image_url: string;
  approved: boolean;
}

interface BingoCell {
  id: string;
  position: number;
  title: string;
  type: string;
  submission: Submission | null;
}

// Supabase Response 전용 인터페이스 (any 방지)
interface SupabaseUserResponse {
  team_id: string;
  name: string;
  teams: {
    discord_channel_id: string | null;
  } | null;
}

interface SupabaseBingoResponse {
  id: string;
  position: number;
  title: string;
  type: string;
  submission: Submission[]; // Join 결과는 배열로 반환됨
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [bingoCells, setBingoCells] = useState<BingoCell[]>([]);
  const [discordId, setDiscordId] = useState<string | null>(null);

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

      // 1. 유저 정보 및 팀 확인 (as unknown as 사용으로 안전한 타입 캐스팅)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("team_id, name, teams(discord_channel_id)")
        .eq("id", session.user.id)
        .single();

      const typedUserData = userData as unknown as SupabaseUserResponse;

      if (userError || !typedUserData?.team_id) {
        setMyTeamId(null);
        setLoading(false);
        return;
      }

      const teamId = typedUserData.team_id;
      setMyTeamId(teamId);
      setDiscordId(typedUserData.teams?.discord_channel_id ?? null);

      // 2. 팀원 리스트 조회
      const { data: members } = await supabase
        .from("users")
        .select("id, name, class, student_id")
        .eq("team_id", teamId);

      if (members) {
        const sortedMembers = (members as TeamMember[]).map(m => ({
          ...m,
          isMe: m.id === session.user.id
        })).sort((a, b) => (a.isMe ? -1 : b.isMe ? 1 : 0));
        setTeamMembers(sortedMembers);
      }

      // 3. 빙고 셀 및 제출 현황 조회
      const { data: cells } = await supabase
        .from("bingo_cells")
        .select(`
          id, position, title, type,
          submission ( id, image_url, approved )
        `)
        .eq("submission.team_id", teamId)
        .order("position", { ascending: true });

      if (cells) {
        const formattedCells: BingoCell[] = (cells as unknown as SupabaseBingoResponse[]).map(cell => ({
          id: cell.id,
          position: cell.position,
          title: cell.title,
          type: cell.type,
          submission: cell.submission && cell.submission.length > 0 ? cell.submission[0] : null
        }));
        setBingoCells(formattedCells);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  const getCellState = (cell: BingoCell) => {
    if (!cell.submission) return { label: "미진행", style: "bg-(--background) text-(--text-tertiary) border-(--border)" };
    if (cell.submission.approved) return { label: "승인됨", style: "bg-green-50 text-green-600 border-green-100" };
    return { label: "검토 중", style: "bg-(--primary-light) text-(--primary) border-(--primary-light)" };
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-(--background)">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--primary-light) border-t-(--primary)" />
    </div>
  );

  if (!myTeamId) return (
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
        {/* 우리 팀 섹션 */}
        <section className="space-y-3">
          <h2 className="px-1 text-[15px] font-bold text-(--text-secondary)">우리 팀</h2>
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
              onClick={() => window.open(`https://discord.com/channels/${discordId || ''}`, '_blank')}
              className="w-32 sm:w-40 flex flex-col items-center justify-center gap-3 rounded-[24px] bg-[#5865F2] text-white shadow-lg hover:bg-[#4752C4]"
            >
              <div className="p-3 bg-white/20 rounded-full text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.579.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
              </div>
              <span className="font-bold text-xs">팀 채팅방</span>
            </motion.button>
          </div>
        </section>

        {/* 빙고 현황 섹션 */}
        <section className="space-y-3">
          <h2 className="px-1 text-[15px] font-bold text-(--text-secondary)">우리 팀 빙고 현황</h2>
          <div className="grid grid-cols-3 gap-3">
            {bingoCells.map((cell) => {
              const { label, style } = getCellState(cell);
              const isSubmitted = !!cell.submission;

              return (
                <motion.button
                  key={cell.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/bingo/${cell.id}`)}
                  className="group relative aspect-square w-full overflow-hidden rounded-[24px] border border-(--border) shadow-sm bg-white"
                >
                  {isSubmitted && cell.submission ? (
                    <>
                      <Image 
                        src={cell.submission.image_url} 
                        alt={cell.title}
                        fill
                        sizes="(max-width: 768px) 33vw, 250px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="relative z-10 flex h-full flex-col justify-end p-3 text-left">
                        <span className={`mb-1.5 self-start rounded-full px-2 py-0.5 text-[9px] font-extrabold border ${style}`}>
                          {label}
                        </span>
                        <p className="text-[12px] font-bold text-white line-clamp-2 leading-tight uppercase tracking-tighter">{cell.title}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-3 text-center">
                      <span className="mb-2 text-[10px] font-bold text-(--text-tertiary)">#{cell.position + 1}</span>
                      <p className="mb-2 text-[12px] font-bold text-(--text-primary) break-keep leading-snug">{cell.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${style}`}>
                        {label}
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