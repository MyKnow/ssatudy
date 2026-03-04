"use client";

import { supabase } from "@/lib/supabaseClient";
import Image from "next/image"; // 1. Image 컴포넌트 임포트
import { useCallback, useEffect, useState } from "react";
import AdminHeader from "../admin_header";

interface PendingSubmission {
  id: string;
  image_url: string | null;
  image_url_2: string | null;
  approved: boolean;
  rejection_reason: string | null;
  created_at: string;
  bingo_cells: { title: string } | null;
  teams: { name: string; category: string } | null;
}

export default function AdminApprovePage() {
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSub, setSelectedSub] = useState<PendingSubmission | null>(null);
  const [reason, setReason] = useState("");
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select(`
          id, image_url, image_url_2, approved, rejection_reason, created_at,
          bingo_cells ( title ),
          teams:team_id ( name, category )
        `)
        .eq("approved", false) 
        .order("created_at", { ascending: true });

      if (error) throw error;
      setSubmissions((data as unknown as PendingSubmission[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("submissions")
      .update({ approved: true, rejection_reason: null })
      .eq("id", id);

    if (!error) {
      setSubmissions(prev => prev.filter(s => s.id !== id));
      setSelectedSub(null);
    }
  };

  const handleReject = async () => {
    if (!selectedSub || !reason.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }

    const { error } = await supabase
      .from("submissions")
      .update({ approved: false, rejection_reason: reason })
      .eq("id", selectedSub.id);

    if (!error) {
      alert("반려 처리되었습니다.");
      setSubmissions(prev => prev.filter(s => s.id !== selectedSub.id));
      setSelectedSub(null);
      setReason("");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">로딩 중...</div>;

  return (
      <div className="min-h-screen bg-[#f8f9fa] pb-40 font-sans">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-4">
          <AdminHeader title="ADMIN / APPROVAL" /> {/* 타이틀 수정: USERS -> APPROVAL */}
          <p className="text-gray-500 font-medium ml-12">제출된 요청을 오래된 순으로 검토합니다.</p>
        </header>

        <div className="mt-8 px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {submissions.map((sub) => (
          <div 
            key={sub.id} 
            onClick={() => { setSelectedSub(sub); setReason(sub.rejection_reason || ""); }}
            className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="relative aspect-square bg-gray-200">
              {sub.image_url && (
                <Image 
                  src={sub.image_url} 
                  alt="Thumbnail" 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform" 
                />
              )}
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg font-bold z-10">
                {new Date(sub.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="p-5">
              <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{sub.teams?.category}</p>
              <h3 className="font-extrabold text-lg line-clamp-1">{sub.teams?.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-1">{sub.bingo_cells?.title}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedSub && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-6xl rounded-[40px] overflow-hidden flex flex-col md:flex-row h-[85vh]">
            <div className="flex-1 bg-[#111] flex items-center justify-center relative h-full">
              <div className="flex w-full h-full p-6 gap-4 items-center justify-center">
                {selectedSub.image_url && (
                  <div 
                    className="relative flex-1 h-full cursor-zoom-in flex items-center justify-center bg-black/20 rounded-2xl overflow-hidden"
                    onClick={() => setZoomImage(selectedSub.image_url)}
                  >
                    <Image 
                      src={selectedSub.image_url} 
                      alt="Detail 1" 
                      fill
                      className="object-contain shadow-2xl transition-transform hover:scale-[1.02]" 
                    />
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded-md opacity-50 font-bold z-10">이미지 #1 (클릭 시 확대)</div>
                  </div>
                )}
                {selectedSub.image_url_2 && (
                  <div 
                    className="relative flex-1 h-full cursor-zoom-in flex items-center justify-center bg-black/20 rounded-2xl overflow-hidden"
                    onClick={() => setZoomImage(selectedSub.image_url_2)}
                  >
                    <Image 
                      src={selectedSub.image_url_2} 
                      alt="Detail 2" 
                      fill
                      className="object-contain shadow-2xl transition-transform hover:scale-[1.02]" 
                    />
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded-md opacity-50 font-bold z-10">이미지 #2 (클릭 시 확대)</div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setSelectedSub(null)} 
                className="absolute top-6 left-6 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full transition-colors z-10"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="w-full md:w-[420px] p-10 flex flex-col bg-white border-l border-gray-100 overflow-y-auto">
              <div className="mb-10">
                <span className="text-blue-600 font-black text-sm uppercase tracking-widest">{selectedSub.teams?.category}</span>
                <h2 className="text-3xl font-black mt-2 leading-tight text-gray-900">{selectedSub.teams?.name}</h2>
                <div className="h-1 w-12 bg-gray-900 mt-4 mb-4" />
                <p className="text-gray-600 font-bold text-xl">{selectedSub.bingo_cells?.title}</p>
                <p className="text-gray-400 text-[11px] mt-6 font-medium uppercase">Submitted: {new Date(selectedSub.created_at).toLocaleString()}</p>
              </div>

              <div className="space-y-4 mb-10">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">반려 사유 입력</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="반려 시 유저에게 보여줄 사유를 적어주세요."
                  className="w-full h-40 p-6 bg-gray-50 border border-gray-100 rounded-[30px] resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <button 
                  onClick={handleReject}
                  className="py-5 rounded-[24px] font-black bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
                >
                  반려
                </button>
                <button 
                  onClick={() => handleApprove(selectedSub.id)}
                  className="py-5 rounded-[24px] font-black bg-gray-900 text-white hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-blue-100"
                >
                  승인 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {zoomImage && (
        <div 
          className="fixed inset-0 z-200 bg-black flex items-center justify-center p-2 md:p-10 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative w-full h-full">
            <Image 
              src={zoomImage} 
              alt="Full Zoom" 
              fill
              className="object-contain shadow-2xl select-none" 
            />
          </div>
          <button className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors z-10">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}