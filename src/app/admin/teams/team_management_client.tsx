"use client";

import { Team, User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import AdminHeader from "../admin_header";
import { deleteTeam, runAutoMatchRPC, upsertTeam } from "./action";

interface TeamWithDescription extends Team {
  description?: string;
}

interface Props {
  teams: (TeamWithDescription & { users?: User[] })[];
}

export default function TeamManagementClient({ teams }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editingTeam, setEditingTeam] = useState<Partial<TeamWithDescription> | null>(null);
  const router = useRouter();

  const handleAutoMatch = () => {
    if (!confirm("⚠️ 모든 유저의 팀 배정을 초기화하고 새로 매칭하시겠습니까?")) return;
    
    startTransition(async () => {
      try {
        await runAutoMatchRPC();
        alert("🎉 자동 매칭이 완료되었습니다!");
        router.refresh();
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "알 수 없는 에러가 발생했습니다.";
        alert("에러 발생: " + errorMessage);
      }
    });
  };

  const handleSaveTeam = async () => {
    const teamName = editingTeam?.name || "";
    if (!teamName.trim()) return alert("팀 이름을 입력해주세요.");

    startTransition(async () => {
      try {
        await upsertTeam({ 
          id: editingTeam?.id, 
          name: teamName, 
          description: editingTeam?.description 
        });
        setEditingTeam(null);
        router.refresh();
      } catch (e) { 
        const errorMessage = e instanceof Error ? e.message : "저장 실패";
        alert(errorMessage); 
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-40 font-sans">
      {/* 고정 헤더 */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <AdminHeader title="ADMIN / TEAMS" />
          <p className="text-gray-400 font-medium text-sm ml-12">
            현재 <span className="text-gray-900 font-bold">{teams.length}개</span>의 팀이 운영 중입니다.
          </p>
          <div className="h-1"></div>
        </div>

        <div className="flex gap-3 w-full md:w-auto ml-0 md:ml-12">
          <button 
            onClick={() => setEditingTeam({ name: "", description: "" })}
            className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-700 px-6 py-3.5 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
          >
            + 팀 추가
          </button>
          <button 
            onClick={handleAutoMatch}
            disabled={isPending}
            className="flex-1 md:flex-none bg-gray-900 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg hover:bg-black transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
          >
            {isPending ? "매칭 중..." : "⚡ 자동 매칭"}
          </button>
        </div>
      </header>

      {/* 팀 그리드: 여백 조절 및 카드 디테일 강화 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((team) => (
          <div key={team.id} className="group relative bg-white p-7 rounded-[38px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{team.name}</h3>
                <p className="text-sm text-gray-400 font-medium line-clamp-1 italic">
                  {team.description || "설명이 등록되지 않았습니다."}
                </p>
              </div>
              
              {/* 카드 액션 버튼: 항상 흐리게 보이다가 호버 시 선명하게 */}
              <div className="flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingTeam(team)} className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors text-blue-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button 
                  onClick={() => confirm("팀을 삭제하시겠습니까?") && deleteTeam(team.id)} 
                  className="p-2.5 hover:bg-red-50 rounded-xl transition-colors text-red-500"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-300">Members</span>
                <span className="text-[11px] font-bold bg-gray-50 text-gray-500 px-3 py-1 rounded-full border border-gray-100">
                  {team.users?.length || 0} / 6
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2.5 min-h-[50px]">
                {team.users && team.users.length > 0 ? (
                  team.users.map(user => (
                    <div 
                      key={user.id} 
                      className={`
                        px-3.5 py-1.5 rounded-2xl text-[12px] font-bold border transition-colors
                        ${user.gender === 'male' 
                          ? 'bg-blue-50/50 text-blue-700 border-blue-100 group-hover:bg-blue-50' 
                          : 'bg-rose-50/50 text-rose-700 border-rose-100 group-hover:bg-rose-50'}
                      `}
                    >
                      {user.name}
                    </div>
                  ))
                ) : (
                  <div className="w-full py-4 text-center rounded-2xl border border-dashed border-gray-100">
                    <p className="text-[11px] text-gray-300 font-medium italic">No members assigned</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 모달: 더 묵직하고 완성도 있게 수정 */}
      {editingTeam && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md p-10 rounded-[45px] shadow-2xl space-y-8 animate-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900">
                {editingTeam.id ? "Edit Team" : "New Team"}
              </h2>
              <p className="text-sm text-gray-400 font-medium px-1">팀 정보를 입력해주세요.</p>
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-indigo-500 transition-colors">Team Name</label>
                <input 
                  className="w-full bg-gray-50 border-2 border-transparent rounded-[22px] px-6 py-4 text-sm font-bold focus:border-gray-900 focus:bg-white transition-all outline-none"
                  value={editingTeam.name || ""}
                  onChange={e => setEditingTeam({...editingTeam, name: e.target.value})}
                  placeholder="예: 알고리즘 1팀"
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-indigo-500 transition-colors">Description</label>
                <textarea 
                  className="w-full bg-gray-50 border-2 border-transparent rounded-[22px] px-6 py-4 text-sm font-medium focus:border-gray-900 focus:bg-white transition-all outline-none min-h-[120px] resize-none"
                  value={editingTeam.description || ""}
                  onChange={e => setEditingTeam({...editingTeam, description: e.target.value})}
                  placeholder="팀의 목표나 특징을 적어주세요."
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button onClick={() => setEditingTeam(null)} className="flex-1 py-5 rounded-[24px] font-bold text-gray-400 hover:text-gray-900 transition-all text-sm">Cancel</button>
              <button onClick={handleSaveTeam} className="flex-1 py-5 bg-gray-900 text-white rounded-[24px] font-black hover:bg-black transition-all shadow-xl active:scale-95 text-sm uppercase tracking-wider">Save Team</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}