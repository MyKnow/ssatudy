/**
 * @id: PAGES_BINGO_DETAIL_V9
 * @description: 제출 후 상태 유지 UX, 로딩 비활성화, 슬라이더 제거 통합 버전
 * @last_modified: 2026-03-02
 */

"use client";

import Card from "@/app/components/card";
import imageCompression from "browser-image-compression";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import Cropper, { Area, Point } from "react-easy-crop";

export default function BingoDetail() {
  const router = useRouter();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"view" | "edit">("view");
  const [image, setImage] = useState<string | null>(null); // 원본(또는 압축된 원본) 이미지
  
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // 미션 데이터 상태 (실제 서비스에서는 API로 관리)
  const [mission, setMission] = useState({
    title: "알고리즘 문제 풀이",
    content: "오늘 푼 문제의 결과 화면을 캡처해서 올려주세요.",
    state: "미진행",
    submittedUrl: null as string | null,
    submittedAt: null as string | null,
  });

  const onCropComplete = useCallback((_ : Area, pixels : Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setImage(reader.result as string);
        setStep("edit");
        setLoading(false);
      };
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!croppedAreaPixels || !image || loading) return;
    
    setLoading(true);
    try {
      // 업로드 시뮬레이션 (실제로는 여기서 Supabase Storage 업로드 로직 실행)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // 1. 서버 응답 성공을 가정하여 로컬 상태 업데이트
      setMission((prev) => ({
        ...prev,
        state: "검토 중",
        submittedUrl: image, // 실제로는 서버에서 받은 저장 경로
        submittedAt: new Date().toLocaleString('ko-KR', { 
          month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        }),
      }));

      // 2. 편집 모드 종료 및 뷰 모드 전환
      setStep("view");
      alert("인증샷이 성공적으로 제출되었습니다!");
      
    } catch (error) {
      alert("전송에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--background) flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center bg-white/80 px-5 py-4 backdrop-blur-md border-b border-(--border)">
        <button 
          onClick={() => step === "edit" ? setStep("view") : router.back()} 
          className="p-1 -ml-1 hover:bg-(--background) rounded-full transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="ml-2 text-lg font-bold text-(--text-primary)">
          {step === "edit" ? "영역 선택" : "미션 상세"}
        </h1>
      </header>

      <main className="flex-1 w-full mx-auto max-w-xl p-6 flex flex-col overflow-x-hidden">
        <AnimatePresence mode="wait">
          {step === "view" ? (
            <motion.div key="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {/* 미션 정보 카드 */}
              <section className="space-y-3">
                <span className="text-[13px] font-bold text-(--primary) tracking-wider px-1 uppercase">MISSION #{id}</span>
                <Card className="p-6 border border-(--border) shadow-sm bg-white">
                  <h2 className="text-2xl font-extrabold text-(--text-primary) mb-3 tracking-tight">{mission.title}</h2>
                  <p className="text-(--text-secondary) leading-relaxed break-keep">{mission.content}</p>
                </Card>
              </section>

              {/* 제출 완료 상태 UI */}
              {mission.state !== "미진행" ? (
                <section className="space-y-4 pt-2">
                  <div className="flex justify-between items-end px-1">
                    <h3 className="text-[15px] font-bold text-(--text-secondary)">제출한 인증샷</h3>
                    <span className="text-[12px] text-(--text-tertiary)">{mission.submittedAt}</span>
                  </div>
                  <div className="relative aspect-square w-full rounded-[32px] overflow-hidden border border-(--border) shadow-inner">
                    <img src={mission.submittedUrl!} alt="Submitted" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-white px-5 py-2 rounded-full shadow-xl flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-(--primary) font-bold text-sm">{mission.state}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 text-sm font-medium text-(--text-tertiary) active:text-(--primary) transition-colors"
                  >
                    사진 다시 올리기
                  </button>
                </section>
              ) : (
                /* 최초 제출 전 UI */
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-16 flex flex-col items-center gap-4 rounded-[32px] border-2 border-dashed border-(--border) bg-white active:bg-(--background) transition-all"
                >
                  <div className="p-4 bg-(--primary-light) rounded-full text-(--primary)">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-(--text-primary)">사진 인증하기</p>
                    <p className="text-sm text-(--text-tertiary) mt-1">카메라 촬영 또는 갤러리 선택</p>
                  </div>
                </button>
              )}
            </motion.div>
          ) : (
            /* 편집 모드 */
            <motion.div key="edit" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col gap-8">
              <div className="relative aspect-square w-full bg-black rounded-[32px] overflow-hidden shadow-2xl border border-(--border)">
                <Cropper
                  image={image!}
                  crop={crop}
                  zoom={zoom}
                  aspect={1 / 1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  showGrid={true}
                  style={{
                    containerStyle: { width: '100%', height: '100%', position: 'relative' }
                  }}
                />
              </div>

              <div className="flex-1 flex flex-col justify-between pb-4">
                <div className="text-center space-y-1">
                  <p className="text-[15px] font-bold text-(--text-primary)">사진을 움직여 위치를 맞추세요</p>
                  <p className="text-[13px] text-(--text-tertiary)">두 손가락으로 확대/축소 가능</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setStep("view")} 
                    disabled={loading}
                    className={`flex-1 py-4.5 rounded-[22px] font-bold transition-all
                      ${loading 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border border-(--border) text-(--text-secondary) active:bg-gray-50'
                      }`}
                  >
                    취소
                  </button>

                  <button 
                    onClick={handleSubmit} 
                    disabled={loading || !croppedAreaPixels} 
                    className={`flex-2 py-4.5 rounded-[22px] font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                      ${loading || !croppedAreaPixels
                        ? 'bg-(--primary) opacity-50 cursor-not-allowed scale-[0.98]' 
                        : 'bg-(--primary) shadow-(--primary)/20 active:scale-[0.97]'
                      }`}
                  >
                    {loading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>전송 중...</span>
                      </>
                    ) : (
                      "검토 요청"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileSelect} />
      </main>
    </div>
  );
}