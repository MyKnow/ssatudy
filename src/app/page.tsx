"use client";

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
import DiscordButton from "./components/discord_button";
import Footer from "./components/footer";
import NavBar from "./components/nav_bar";

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
    // 상단 레이아웃을 layout.tsx에 맡기므로 여기서는 최소한의 컨테이너만 유지
    <div className="pb-10">
      <NavBar />

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
            <DiscordButton channelId={userData.teams?.discord_channel_id} />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="px-1 text-[15px] font-bold text-(--text-secondary)">우리 팀 빙고 현황</h2>
          {/* 💡 Grid 설정 변경: 
              items-start를 추가하여 셀이 세로로 늘어나는 것을 방지하고, 
              w-full과 max-w-full을 명시합니다. */}
          <div className="grid grid-cols-3 gap-3 w-full items-start">
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
      <Footer />
    </div>
  );
}