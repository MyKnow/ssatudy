/**
 * @id: PAGES_LOGIN_V2
 * @description: TDS 가이드라인이 적용된 로그인 페이지 (Suspense 적용 버전)
 */

"use client";

import { supabase } from "@/lib/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react"; // Suspense 추가
import Card from "../components/card";
import CTAButton from "../components/cta_button";
import InputField from "../components/inputfield";
import TextLinkButton from "../components/text_button";

// 1️⃣ useSearchParams를 사용하는 실제 로직 컴포넌트
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showVerifyMessage = searchParams.get("verifyEmail") === "true";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(
    showVerifyMessage ? "회원가입 완료! 이메일 인증 링크를 확인해주세요." : ""
  );

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/");
      } else {
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/");
    });

    return () => authListener.subscription.unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        if (error.status === 400) {
          setMessage("아이디 또는 비밀번호를 확인해주세요.");
        } else {
          setMessage(error.message);
        }
      } else {
        router.replace("/");
      }
    } catch {
      setMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--background) flex flex-col items-center justify-center px-5 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="flex flex-col gap-10">
          <div className="space-y-2 text-center">
            <h1 className="text-[28px] font-bold text-(--text-primary) tracking-tight">
              로그인
            </h1>
            <p className="text-[15px] text-(--text-secondary)">
              서비스 이용을 위해 계정에 로그인하세요.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-xl text-sm font-medium text-center overflow-hidden ${
                  message.includes("완료") 
                    ? "bg-blue-50 text-blue-600" // CSS 변수 대신 명시적 컬러 권장 (에러 방지)
                    : "bg-red-50 text-red-500"
                }`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              label="이메일"
              type="email"
              name="email"
              placeholder="이메일 주소 입력"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            <InputField
              label="비밀번호"
              type="password"
              name="password"
              placeholder="비밀번호 입력"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            
            <div className="pt-4">
              <CTAButton
                type="submit"
                loading={loading}
                disabled={loading || !form.email || !form.password}
              >
                로그인
              </CTAButton>
            </div>
          </form>

          <div className="flex justify-center items-center gap-4 pt-2">
            <TextLinkButton text="회원가입" href="/signup" />
            <div className="w-px h-3 bg-gray-200" />
            <TextLinkButton text="비밀번호 재설정" href="/reset-password" />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// 2️⃣ 실제 페이지 컴포넌트: LoginForm을 Suspense로 감싸서 export
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}