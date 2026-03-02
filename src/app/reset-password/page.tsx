/**
 * @id: PAGES_RESET_PASSWORD_FULL_V5
 * @description: 간격 및 패딩 최적화로 밀도 있는 UI 구현 (Compact UX)
 * @last_modified: 2026-03-03
 */

"use client";

import { supabase } from "@/lib/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import Card from "../components/card";
import CTAButton from "../components/cta_button";
import InputField from "../components/inputfield";
import TextLinkButton from "../components/text_button";

type Step = "EMAIL" | "OTP" | "NEW_PASSWORD" | "SUCCESS";

export default function ResetPasswordPage() {
  const [step, setStep] = useState<Step>("EMAIL");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "info" });

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const emailError = useMemo(() => {
    if (!email) return "";
    return !email.includes("@") ? "올바른 이메일 형식을 입력해주세요." : "";
  }, [email]);

  const passwordError = useMemo(() => {
    if (!newPassword) return "";
    return newPassword.length < 8 ? "비밀번호는 8자 이상이어야 합니다." : "";
  }, [newPassword]);

  const matchError = useMemo(() => {
    if (!confirmPassword) return "";
    return newPassword !== confirmPassword ? "비밀번호가 일치하지 않습니다." : "";
  }, [newPassword, confirmPassword]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError || !email) return;
    setLoading(true);
    setMessage({ text: "", type: "" });

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (error) {
      setMessage({ text: "등록되지 않은 계정이거나 요청 한도 초과입니다.", type: "error" });
    } else {
      setStep("OTP");
      setMessage({ text: "인증번호 6자리를 발송했습니다.", type: "success" });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      setMessage({ text: "인증번호가 틀렸거나 만료되었습니다.", type: "error" });
    } else {
      setStep("NEW_PASSWORD");
      setMessage({ text: "인증되었습니다. 새 비밀번호를 설정하세요.", type: "success" });
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordError || matchError || !newPassword) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage({ text: "변경 중 오류가 발생했습니다.", type: "error" });
    } else {
      setStep("SUCCESS");
      await supabase.auth.signOut();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-(--background) flex flex-col items-center justify-center px-5 font-sans">
      <motion.div layout className="w-full max-w-sm"> {/* max-w-md에서 sm으로 줄여 더 밀도 있게 */}
        <Card className="flex flex-col gap-7 py-8 px-6 bg-white border border-(--border) shadow-sm rounded-[28px]">
          {/* Header: 간격 축소 */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-[22px] font-extrabold text-(--text-primary) tracking-tight">
              {step === "EMAIL" && "비밀번호 찾기"}
              {step === "OTP" && "인증번호 확인"}
              {step === "NEW_PASSWORD" && "비밀번호 재설정"}
              {step === "SUCCESS" && "변경 완료"}
            </h1>
            <p className="text-[14px] text-(--text-secondary) leading-snug whitespace-pre-line">
              {step === "EMAIL" && "가입하신 이메일을 입력해주세요."}
              {step === "OTP" && `${email}로 보낸\n번호 6자리를 입력해주세요.`}
              {step === "NEW_PASSWORD" && "새로운 비밀번호를 입력해주세요."}
              {step === "SUCCESS" && "안전하게 변경되었습니다.\n다시 로그인해주세요."}
            </p>
          </div>

          {/* Feedback Message: 컴팩트화 */}
          <AnimatePresence mode="wait">
            {message.text && step !== "SUCCESS" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`py-2.5 px-4 rounded-lg text-[13px] font-medium text-center ${
                  message.type === "success" ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500"
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Area: 최소 높이 제거 및 간격 최적화 */}
          <div className="flex flex-col">
            {step === "EMAIL" && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <InputField
                  label="이메일 주소"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={emailError}
                />
                <CTAButton type="submit" loading={loading} disabled={!email || !!emailError}>
                  인증번호 받기
                </CTAButton>
              </form>
            )}

            {step === "OTP" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <InputField
                  label="인증번호"
                  name="otp"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  autoComplete="one-time-code"
                />
                <div className="space-y-3">
                  <CTAButton type="submit" loading={loading} disabled={otp.length !== 6}>
                    인증하기
                  </CTAButton>
                  <button type="button" onClick={() => setStep("EMAIL")} className="w-full text-[13px] text-(--text-tertiary) hover:text-(--text-secondary)">
                    이메일 주소 재입력
                  </button>
                </div>
              </form>
            )}

            {step === "NEW_PASSWORD" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <InputField
                  label="새 비밀번호"
                  name="newPassword"
                  type="password"
                  placeholder="8자 이상"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={passwordError}
                />
                <InputField
                  label="비밀번호 확인"
                  name="confirmPassword"
                  type="password"
                  placeholder="한 번 더 입력"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={matchError}
                />
                <div className="pt-1">
                  <CTAButton type="submit" loading={loading} disabled={!newPassword || !!passwordError || !!matchError}>
                    변경하기
                  </CTAButton>
                </div>
              </form>
            )}

            {step === "SUCCESS" && (
              <div className="space-y-5 flex flex-col items-center py-2">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3"><path d="M20 6L9 17L4 12"/></svg>
                </div>
                <CTAButton onClick={() => window.location.href = '/login'}>로그인하러 가기</CTAButton>
              </div>
            )}
          </div>

          {/* Footer: 상단 여백 축소 */}
          {step === "EMAIL" && (
            <div className="flex justify-center items-center gap-4 border-t border-(--border) pt-6 mt-1">
              <TextLinkButton text="로그인" href="/login" />
              <div className="w-px h-3 bg-(--border)" />
              <TextLinkButton text="회원가입" href="/signup" />
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}