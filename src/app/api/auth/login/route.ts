// app/api/auth/login/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 로그인 실패
  if (error) {
    return NextResponse.json({ success: false, error: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
  }

  // 유저가 없거나 이메일 인증 안됨
  if (!data.user) {
    return NextResponse.json({ success: false, error: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
  }

  if (!data.user.email_confirmed_at) {
    return NextResponse.json({ success: false, error: "이메일 인증이 필요합니다." }, { status: 401 });
  }

  // 정상 로그인
  return NextResponse.json({ success: true, user: data.user });
}