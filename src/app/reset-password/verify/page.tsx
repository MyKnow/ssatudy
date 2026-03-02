// /reset-password/verify/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import CTAButton from "../../components/cta_button";
import InputField from "../../components/inputfield";

export default function ResetPasswordVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const type = searchParams.get("type");
  const redirectTo = searchParams.get("redirect_to") || "/login";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // token 없거나 type !== "recovery"이면 form 숨김
  const showForm = token && type === "recovery";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showForm) return;

    if (password !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("비밀번호가 재설정되었습니다. 로그인 페이지로 이동합니다.");
        setTimeout(() => router.push(redirectTo), 2000);
      } else {
        setMessage("실패: " + (data.error || "알 수 없는 오류"));
      }
    } catch {
      setMessage("네트워크 오류 발생");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-5 font-pretendard bg-background">
      <div className="w-full max-w-md p-8 bg-surface rounded-xl shadow-md space-y-6">
        <h1 className="text-3xl font-bold text-primary text-center mb-6">
          비밀번호 재설정
        </h1>

        {(!showForm && token) && (
          <p className="text-center mb-4 font-medium text-red-600">
            유효하지 않은 링크입니다.
          </p>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              type="password"
              name="password"
              placeholder="새 비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputField
              type="password"
              name="confirmPassword"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <CTAButton
              type="submit"
              loading={loading}
              disabled={loading || !password || !confirmPassword}
            >
              비밀번호 재설정
            </CTAButton>
          </form>
        )}
      </div>
    </div>
  );
}