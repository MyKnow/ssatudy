import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, student_id, class: userClass, gender, category } = body;

    // 1️⃣ Supabase Auth 가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "사용자 생성에 실패했습니다." }, { status: 500 });
    }

    // 2️⃣ users 테이블에 데이터 insert
    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        id: userId,
        student_id,
        name,
        class: userClass,
        gender,
        category,
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "서버 오류가 발생했습니다.", details: e }, { status: 500 });
  }
}