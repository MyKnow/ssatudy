"use client";

import { useState } from "react";
import CTAButton from "../components/cta_button";
import InputField from "../components/inputfield";
import TextLinkButton from "../components/text_button";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("이메일로 비밀번호 재설정 링크가 발송되었습니다.");
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

        {message && (
          <p
            className={`text-center mb-4 font-medium ${
              message.includes("발송") ? "text-green-600" : "text-red-600"
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
            value={email}
            onChange={handleChange}
            autoComplete="email"
          />
          <CTAButton
            type="submit"
            loading={loading}
            disabled={loading || !email}
          >
            재설정 링크 보내기
          </CTAButton>
        </form>

        <div className="flex justify-between mt-4 text-sm text-primary">
          <TextLinkButton text="로그인으로 돌아가기" href="/login" />
          <TextLinkButton text="회원가입" href="/signup" />
        </div>
      </div>
    </div>
  );
}