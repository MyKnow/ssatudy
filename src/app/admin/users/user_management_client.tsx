"use client";

import { CategoryType, GenderType, Team, User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import AdminHeader from "../admin_header";
import { deleteUserAdmin, updateAllUsers } from "./action";

interface Props {
  initialUsers: User[];
  teams: Team[];
}

export default function UserManagementClient({ initialUsers = [], teams = [] }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const isDirty = useMemo(() => JSON.stringify(users) !== JSON.stringify(initialUsers), [users, initialUsers]);

  const handleFieldChange = (id: string, field: keyof User, value: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  };

  const handleSave = () => {
    if (users.some(u => !u.name || !u.student_id)) {
      alert("이름과 학번은 필수 입력 사항입니다.");
      return;
    }

    startTransition(async () => {
      try {
        await updateAllUsers(users);
        alert("성공적으로 저장되었습니다.");
        router.refresh();
      } catch (err) {
        alert("저장 중 오류가 발생했습니다.: " + err);
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = confirm(`⚠️ 정말로 [${name || '신규 유저'}] 님을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`);
    if (!isConfirmed) return;

    if (id.startsWith("temp-")) {
      setUsers(users.filter(u => u.id !== id));
      return;
    }

    startTransition(async () => {
      try {
        await deleteUserAdmin(id);
        setUsers(users.filter(u => u.id !== id));
        router.refresh();
      } catch {
        alert("삭제 실패");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-40 font-sans">
      {/* 고정 헤더 */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          
          {/* 상단 액션 바: 뒤로가기 & 타이틀 */}
          <AdminHeader title="ADMIN / USERS" />

          {/* 검색 바: 아이콘과 겹침 문제 해결 */}
          {/* 검색 바: 구조적으로 분리하여 절대 겹치지 않게 수정 */}
          <div className="flex items-center w-full bg-gray-100 rounded-2xl px-4 transition-all">
            {/* 아이콘: 이제 absolute가 아니라 flex 요소입니다 */}
            <div className="shrink-0 mr-3">
              <svg 
                className="text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            
            {/* 인풋: 배경색을 투명하게(bg-transparent) 하고 왼쪽 패딩을 0으로 둡니다 */}
            <input 
              type="text"
              placeholder="찾으시는 유저의 이름을 입력하세요"
              className="w-full bg-transparent border-none py-3.5 text-sm font-medium outline-none text-gray-900 placeholder:text-gray-400 "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-3 mt-2">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const isModified = JSON.stringify(user) !== JSON.stringify(initialUsers.find(u => u.id === user.id));
            const isNew = user.id.startsWith("temp-");
            
            return (
              <div key={user.id} className={`relative p-4 bg-white border rounded-2xl transition-all ${isNew ? 'border-green-400 bg-green-50/10' : isModified ? 'border-blue-400 shadow-md bg-blue-50/10' : 'border-gray-200 shadow-sm'}`}>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex flex-wrap gap-3 flex-2">
                    <div className="flex-1 min-w-[70px]">
                      <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Name</p>
                      <input
                        maxLength={5}
                        className="w-full bg-gray-50 border-none rounded-lg px-2 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500"
                        value={user.name}
                        onChange={(e) => handleFieldChange(user.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="flex-[1.5] min-w-[100px]">
                      <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Student ID</p>
                      <input
                        maxLength={7}
                        className="w-full bg-gray-50 border-none rounded-lg px-2 py-2 text-sm font-mono font-medium"
                        value={user.student_id}
                        onChange={(e) => handleFieldChange(user.id, "student_id", e.target.value)}
                      />
                    </div>
                    <div className="w-[50px]">
                      <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 text-center">Class</p>
                      <input
                        maxLength={2}
                        className="w-full bg-gray-50 border-none rounded-lg px-2 py-2 text-sm text-center font-bold"
                        value={user.class}
                        onChange={(e) => handleFieldChange(user.id, "class", e.target.value)}
                      />
                    </div>
                    <div className="w-[70px]">
                      <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Gender</p>
                      <select
                        className="w-full bg-gray-50 border-none rounded-lg px-2 py-2 text-xs font-bold outline-none"
                        value={user.gender}
                        onChange={(e) => handleFieldChange(user.id, "gender", e.target.value as GenderType)}
                      >
                        <option value="male">남성</option>
                        <option value="female">여성</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 flex-[1.5] pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="flex-1 min-w-[110px]">
                      <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Category</p>
                      <select
                        className="w-full bg-blue-50 border-none rounded-lg px-2 py-2 text-xs font-black text-blue-600 uppercase outline-none"
                        value={user.category}
                        onChange={(e) => handleFieldChange(user.id, "category", e.target.value as CategoryType)}
                      >
                        <option value="algorithm">Algorithm</option>
                        <option value="cs">CS</option>
                        <option value="interview">Interview</option>
                      </select>
                    </div>
                    <div className="flex-[1.5] min-w-[130px]">
                      <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Team</p>
                      <select
                        className="w-full bg-gray-900 border-none rounded-lg px-3 py-2 text-xs font-bold text-white outline-none"
                        value={user.team_id || "none"}
                        onChange={(e) => handleFieldChange(user.id, "team_id", e.target.value)}
                      >
                        <option value="none">UNASSIGNED</option>
                        {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleDelete(user.id, user.name)}
                  className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 transition-colors"
                  title="유저 삭제"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-400 font-medium">검색 결과가 없습니다.</p>
            <button 
              onClick={() => setSearchTerm("")} 
              className="text-indigo-600 text-sm font-bold hover:underline"
            >
              검색 초기화
            </button>
          </div>
        )}
      </main>

      {/* 하단 고정 저장 버튼 */}
      <div className="fixed bottom-8 left-0 right-0 px-6 z-50 flex justify-center">
        <button
          onClick={handleSave}
          disabled={!isDirty || isPending}
          className={`w-full max-w-sm py-4 rounded-2xl font-black text-sm tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 ${
            isPending ? 'bg-gray-400 text-white cursor-not-allowed' : 
            isDirty ? 'bg-black text-white hover:scale-[1.02] active:scale-95 shadow-indigo-200' : 'bg-white text-gray-300 border border-gray-200 cursor-not-allowed opacity-60'
          }`}
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              저장 중...
            </>
          ) : "SAVE ALL CHANGES"}
        </button>
      </div>
    </div>
  );
}