import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer"; // 👈 서버용 클라이언트 임포트
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, student_id, class: userClass, gender, category } = body;

    console.log("🚀 가입 시도:", { email, name, student_id });

    // 1️⃣ 서버용 Supabase 클라이언트 생성
    const supabase = await createClient(); // 👈 여기서 서버 전용으로 생성

    // 2️⃣ Supabase Auth 가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("❌ Auth 에러:", authError.message);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "사용자 ID 생성 실패" }, { status: 500 });
    }

    // 3️⃣ users 테이블에 데이터 insert (여기는 admin 권한 필요하므로 기존대로 유지)
    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        id: userId,
        student_id: student_id,
        name: name,
        class: userClass,
        gender: gender,
        category: category,
      });

    if (insertError) {
      console.error("❌ DB Insert 에러:", insertError);
      return NextResponse.json({ 
        error: "사용자 정보 저장 실패", 
        details: insertError.message,
      }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "알 수 없는 서버 오류";
    console.error("🔥 서버 내부 오류:", e);
    return NextResponse.json({ 
      error: "서버 오류가 발생했습니다.", 
      message: errorMessage,
    }, { status: 500 });
  }
}