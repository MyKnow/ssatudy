"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CTAButton from "../components/cta_button";
import InputField from "../components/inputfield";
import TextLinkButton from "../components/text_button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showVerifyMessage = searchParams.get("verifyEmail") === "true";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    showVerifyMessage ? "회원가입 완료! 이메일 인증 링크를 확인해주세요." : ""
  );

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/");
      } else {
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          router.replace("/");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error?.message === "Invalid login credentials") {
        setMessage("아이디 또는 비밀번호를 확인해주세요.");
      }
      if (error) {
        setMessage("로그인 실패: " + error.message);
      } else {
        router.replace("/");
      }
    } catch {
      setMessage("로그인 실패: 네트워크 오류");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-5 font-pretendard bg-background">
      <div className="w-full max-w-md p-8 bg-surface rounded-xl shadow-md space-y-6">
        <h1 className="text-3xl font-bold text-primary text-center mb-6">로그인</h1>

        {message && (
          <p
            className={`text-center mb-4 font-medium ${
              message.includes("완료") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="email"
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
          <InputField
            type="password"
            name="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          <CTAButton
            type="submit"
            loading={loading}
            disabled={loading || !form.email || !form.password}
          >
            로그인
          </CTAButton>
        </form>

        <div className="flex justify-between mt-4 text-sm text-primary">
          <TextLinkButton text="회원가입" href="/signup" />
          <TextLinkButton text="비밀번호 재설정" href="/reset-password" />
        </div>
      </div>
    </div>
  );
}