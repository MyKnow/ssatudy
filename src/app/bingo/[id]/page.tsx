/* eslint-disable @next/next/no-img-element */
"use client";

import Card from "@/app/components/card";
import { supabase } from "@/lib/supabaseClient";
import { BingoCell, BingoResponse } from "@/lib/types";
import imageCompression from "browser-image-compression";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { Area, Point } from "react-easy-crop";

/**
 * 헬퍼 함수: 사용자가 선택한 영역(pixelCrop)대로 이미지를 잘라 Blob으로 반환
 */
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new window.Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas context를 생성할 수 없습니다.");

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas to Blob conversion failed"));
    }, "image/jpeg", 0.9);
  });
}

export default function BingoDetail() {
  const router = useRouter();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [cell, setCell] = useState<BingoCell | null>(null);
  
  const [step, setStep] = useState<"view" | "edit">("view");
  const [activeSlot, setActiveSlot] = useState<1 | 2>(1);
  const [tempImage, setTempImage] = useState<string | null>(null);
  
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // 1. 데이터 가져오기
  const fetchCellData = useCallback(async () => {
    const { data, error } = await supabase
      .from("bingo_cells")
      .select(`
        id, position, title, type, team_id, required_count,
        submission:submissions ( id, image_url, image_url_2, approved, rejection_reason, created_at )
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      alert("데이터를 불러올 수 없습니다.");
      router.push("/");
      return;
    }

    const rawData = data as unknown as BingoResponse;
    const formattedCell: BingoCell = {
      ...rawData,
      required_count: Number(rawData.required_count),
      submission: rawData.submission && rawData.submission.length > 0 
        ? rawData.submission[0] 
        : null
    };

    setCell(formattedCell);
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchCellData();
  }, [fetchCellData]);

  // 2. 이미지 선택 핸들러
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setActiveSlot(slot);
      
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1500, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setStep("edit");
        setUploading(false);
        // 다음 선택을 위해 input 초기화
        e.target.value = "";
      };
    } catch (error) {
      console.error("Compression Error:", error);
      setUploading(false);
    }
  };

  const onCropComplete = useCallback((_ : Area, pixels : Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // 3. 최종 제출
  const handleSubmit = async () => {
    if (!tempImage || !cell || !croppedAreaPixels || uploading) return;

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("로그인이 만료되었습니다.");

      const croppedBlob = await getCroppedImg(tempImage, croppedAreaPixels);
      const fileExt = "jpg";
      const fileName = `${cell.team_id}/${cell.id}/slot${activeSlot}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("bingo_submissions")
        .upload(fileName, croppedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("bingo_submissions")
        .getPublicUrl(fileName);

      const upsertData = {
        bingo_cell_id: cell.id,
        team_id: cell.team_id,
        user_id: session.user.id,
        approved: false,         // 다시 올리면 검토 중으로 변경
        rejection_reason: null,  // 반려 사유 초기화
        ...(activeSlot === 1 ? { image_url: publicUrl } : { image_url_2: publicUrl }),
      };

      const { error: dbError } = await supabase
        .from("submissions")
        .upsert(upsertData, { onConflict: "team_id,bingo_cell_id" });

      if (dbError) throw dbError;

      setStep("view");
      await fetchCellData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "알 수 없는 오류";
      alert("제출 실패: " + message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">로딩 중...</div>;
  if (!cell) return null;

  return (
    <div className="min-h-screen bg-(--background) flex flex-col">
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

      <main className="flex-1 w-full mx-auto max-w-xl p-6 flex flex-col">
        <AnimatePresence mode="wait">
          {step === "view" ? (
            <motion.div key="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <section className="space-y-3">
                <span className="text-[13px] font-bold text-(--primary) tracking-wider px-1 uppercase">
                  MISSION #{cell.position + 1}
                </span>
                <Card className="p-6 border border-(--border) shadow-sm bg-white">
                  <h2 className="text-2xl font-extrabold text-(--text-primary) mb-3 tracking-tight">{cell.title}</h2>
                  <p className="text-(--text-secondary) leading-relaxed break-keep">
                    {cell.required_count === 2 ? "이 미션은 사진 2장이 필요합니다. 사진을 눌러 수정할 수 있습니다." : "사진을 눌러 인증샷을 업로드하거나 수정하세요."}
                  </p>
                </Card>
              </section>

              <div className="space-y-8 pt-2">
                {Array.from({ length: cell.required_count }).map((_, i) => {
                  const slot = (i + 1) as 1 | 2;
                  const imageUrl = slot === 1 ? cell.submission?.image_url : cell.submission?.image_url_2;

                  return (
                    <section key={slot} className="space-y-4">
                      <div className="flex justify-between items-end px-1">
                        <h3 className="text-[15px] font-bold text-(--text-secondary)">인증샷 #{slot}</h3>
                      </div>

                      {imageUrl ? (
                        <div 
                          onClick={() => {
                            setActiveSlot(slot);
                            fileInputRef.current?.click();
                          }}
                          className="relative aspect-square w-full rounded-[32px] overflow-hidden border border-(--border) shadow-sm bg-gray-50 cursor-pointer active:scale-[0.98] transition-transform group"
                        >
                          <img src={imageUrl} alt={`Submitted ${slot}`} className="w-full h-full object-cover" />
                          
                          {/* 상태 표시 배지 */}
                          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                            {cell.submission?.rejection_reason ? (
                              <div className="bg-red-500 text-white px-3 py-1 rounded-full shadow-lg flex items-center gap-2 border border-white/20">
                                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                <span className="text-[12px] font-bold">반려됨</span>
                              </div>
                            ) : (
                              <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm flex items-center gap-2 border border-black/5">
                                <span className={`h-2 w-2 rounded-full ${cell.submission?.approved ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                                <span className="text-[12px] font-bold">{cell.submission?.approved ? '승인완료' : '검토중'}</span>
                              </div>
                            )}
                          </div>

                          {/* ✨ 우측 하단 연필 아이콘 (수정 가능함을 알리는 용도) */}
                          <div className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur rounded-full shadow-xl border border-black/5 text-(--text-primary) group-hover:bg-white transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setActiveSlot(slot);
                            fileInputRef.current?.click();
                          }}
                          disabled={uploading}
                          className="w-full py-16 flex flex-col items-center gap-4 rounded-[32px] border-2 border-dashed border-(--border) bg-white active:bg-gray-50 transition-all"
                        >
                          <div className="p-4 bg-(--primary-light) rounded-full text-(--primary)">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-lg text-(--text-primary)">사진 인증하기</p>
                            <p className="text-sm text-(--text-tertiary) mt-1">인증샷 #{slot} 업로드</p>
                          </div>
                        </button>
                      )}
                      
                      {cell.submission?.rejection_reason && (
                        <div className="mt-2 p-4 bg-red-50 border border-red-100 rounded-[20px]">
                          <p className="text-red-600 text-[11px] font-bold mb-1 uppercase tracking-tight">반려 사유</p>
                          <p className="text-red-800 text-sm font-semibold break-keep leading-snug">
                            {cell.submission.rejection_reason}
                          </p>
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div key="edit" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col gap-8">
              <div className="relative aspect-square w-full bg-black rounded-[32px] overflow-hidden shadow-2xl border border-(--border)">
                <Cropper
                  image={tempImage!}
                  crop={crop}
                  zoom={zoom}
                  aspect={1 / 1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  showGrid={true}
                  style={{ containerStyle: { width: '100%', height: '100%', position: 'relative' } }}
                />
              </div>

              <div className="flex-1 flex flex-col justify-between pb-4">
                <div className="text-center space-y-1">
                  <p className="text-[15px] font-bold text-(--text-primary)">인증샷 #{activeSlot} 영역 선택</p>
                  <p className="text-[13px] text-(--text-tertiary)">사진을 드래그하여 위치를 조정하세요</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setStep("view")} 
                    className="flex-1 py-4.5 rounded-[22px] font-bold bg-white border border-(--border) text-(--text-secondary) active:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={uploading || !croppedAreaPixels}
                    className="flex-2 py-4.5 rounded-[22px] font-bold text-white bg-(--primary) shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    {uploading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : "검토 요청"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => handleFileSelect(e, activeSlot)} 
        />
      </main>
    </div>
  );
}