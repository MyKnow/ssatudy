import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. 권한 체크
  if (!user || !user.email || !isAdmin(user.email)) {
    redirect("/");
  }

  // 2. 통계 데이터 병렬 로딩 (미션 대기 건수 추가)
  const [usersRes, teamsRes, pendingRes] = await Promise.all([
    supabaseAdmin.from("users").select("id", { count: "exact" }),
    supabaseAdmin.from("teams").select("id", { count: "exact" }),
    supabaseAdmin.from("submissions").select("id", { count: "exact" }).eq("approved", false),
  ]);

  const stats = [
    { label: "전체 사용자", count: usersRes.count ?? 0, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "운영 팀 수", count: teamsRes.count ?? 0, color: "text-indigo-600", bg: "bg-indigo-50" },
    { 
      label: "검토 대기 미션", 
      count: pendingRes.count ?? 0, 
      color: "text-rose-600", 
      bg: "bg-rose-50",
      isAlert: (pendingRes.count ?? 0) > 0 
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 헤더 섹션 */}
        <header className="flex justify-between items-end">
          <div>
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-1">Control Panel</p>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Admin Dashboard</h1>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-400">접속 계정</p>
            <p className="text-sm font-bold text-gray-700">{user.email}</p>
          </div>
        </header>

        {/* 요약 통계 카드 (3열로 확장) */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={`${stat.bg} p-6 rounded-[32px] border border-white shadow-sm transition-transform hover:scale-[1.02]`}>
              <p className="text-xs font-bold text-gray-500 mb-2">{stat.label}</p>
              <p className={`text-4xl font-black ${stat.color}`}>
                {stat.count}
                {stat.label === "검토 대기 미션" && <span className="text-sm ml-1 opacity-50 font-bold text-gray-400 uppercase">건</span>}
              </p>
            </div>
          ))}
        </section>

        {/* 메뉴 네비게이션 */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 ml-1 italic tracking-tight uppercase">Management</h2>
          <div className="grid gap-4">
            
            {/* 1. 미션 승인 관리 (신규 추가) */}
            <Link href="/admin/approve" className="group">
              <div className="flex items-center justify-between bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:border-rose-500 hover:shadow-xl transition-all relative overflow-hidden">
                {/* 대기 건수가 있을 때 표시되는 강조 라인 */}
                {(pendingRes.count ?? 0) > 0 && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500" />}
                
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                      미션 승인/반려 관리
                      {(pendingRes.count ?? 0) > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">PENDING</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium leading-tight">제출된 이미지를 확인하고 점수를 승인합니다.</p>
                  </div>
                </div>
                <div className="text-gray-200 group-hover:text-rose-600 transform group-hover:translate-x-1 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            </Link>

            {/* 2. 유저 관리 메뉴 */}
            <Link href="/admin/users" className="group">
              <div className="flex items-center justify-between bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:border-blue-500 hover:shadow-xl transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-900">사용자 데이터 관리</h3>
                    <p className="text-sm text-gray-400 font-medium leading-tight">유저 정보 수정, 검색 및 삭제</p>
                  </div>
                </div>
                <div className="text-gray-200 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            </Link>

            {/* 3. 팀 및 배정 관리 메뉴 */}
            <Link href="/admin/teams" className="group">
              <div className="flex items-center justify-between bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:border-indigo-500 hover:shadow-xl transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M3 9h18"/></svg>
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-900">팀 및 배정 관리</h3>
                    <p className="text-sm text-gray-400 font-medium leading-tight">자동 매칭 실행 및 팀별 멤버 구성 관리</p>
                  </div>
                </div>
                <div className="text-gray-200 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            </Link>

          </div>
        </section>

        {/* 하단 로그아웃/홈가기 */}
        <footer className="pt-10 flex justify-center gap-6 border-t border-gray-100">
          <Link href="/" className="text-sm font-black text-gray-400 hover:text-gray-900 transition-colors italic tracking-widest uppercase">Back to Home</Link>
        </footer>
      </div>
    </div>
  );
}