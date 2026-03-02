/**
 * @id: PAGES_RESET_PASSWORD_FULL_V4
 * @description: Supabase Auth 실제 연동 및 단계별 UI 전환 (전체 코드)
 * @last_modified: 2026-03-03
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import Card from "../components/card";
import CTAButton from "../components/cta_button";
import InputField from "../components/inputfield";
import TextLinkButton from "../components/text_button";

import { supabase } from "@/lib/supabaseClient";

// 페이지 내 진행 단계를 정의합니다.
type Step = "EMAIL" | "OTP" | "NEW_PASSWORD" | "SUCCESS";

export default function ResetPasswordPage() {

  // 상태 관리
  const [step, setStep] = useState<Step>("EMAIL");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "info" });

  // 입력 필드 상태
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 실시간 유효성 검사 (Memoized)
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

  /**
   * 1단계: 인증 번호(OTP) 발송
   * 사용자가 입력한 이메일로 6자리 숫자를 보냅니다.
   */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError || !email) return;

    setLoading(true);
    setMessage({ text: "", type: "" });

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // 기존 가입자만 비밀번호 재설정이 가능하도록 설정
        shouldCreateUser: false,
      },
    });

    if (error) {
      setMessage({ 
        text: "등록되지 않은 이메일이거나 요청 한도를 초과했습니다.", 
        type: "error" 
      });
    } else {
      setStep("OTP");
      setMessage({ 
        text: "이메일로 6자리 인증번호를 보내드렸어요.", 
        type: "success" 
      });
    }
    setLoading(false);
  };

  /**
   * 2단계: OTP 번호 검증
   * 사용자가 메일에서 확인한 번호를 입력하여 본인임을 인증합니다.
   */
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
      setMessage({ text: "인증번호가 올바르지 않거나 만료되었습니다.", type: "error" });
    } else {
      setStep("NEW_PASSWORD");
      setMessage({ text: "인증 성공! 새로운 비밀번호를 설정해주세요.", type: "success" });
    }
    setLoading(false);
  };

  /**
   * 3단계: 비밀번호 최종 업데이트
   * 본인이 직접 입력한 새 비밀번호로 계정 정보를 갱신합니다.
   */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordError || matchError || !newPassword) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMessage({ text: "비밀번호 변경 중 오류가 발생했습니다.", type: "error" });
    } else {
      setStep("SUCCESS");
      // 보안을 위해 세션을 종료하고 다시 로그인하게 유도합니다.
      await supabase.auth.signOut();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-(--background) flex flex-col items-center justify-center px-5 font-sans">
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="flex flex-col gap-10 py-12 px-8 bg-white border border-(--border) shadow-sm rounded-[32px]">
          {/* 단계별 헤더 타이틀 */}
          <div className="space-y-3 text-center">
            <h1 className="text-[26px] font-bold text-(--text-primary) tracking-tight">
              {step === "EMAIL" && "비밀번호 찾기"}
              {step === "OTP" && "인증번호 확인"}
              {step === "NEW_PASSWORD" && "비밀번호 재설정"}
              {step === "SUCCESS" && "변경 완료"}
            </h1>
            <p className="text-[15px] text-(--text-secondary) leading-relaxed">
              {step === "EMAIL" && "가입하신 이메일을 입력하시면\n인증번호를 보내드려요."}
              {step === "OTP" && `${email}로 보낸\n인증번호 6자리를 입력해주세요.`}
              {step === "NEW_PASSWORD" && "이제 본인이 사용할\n새 비밀번호를 입력해주세요."}
              {step === "SUCCESS" && "비밀번호가 안전하게 변경되었습니다.\n새로운 비밀번호로 로그인해주세요."}
            </p>
          </div>

          {/* 피드백 메시지 영역 */}
          <AnimatePresence mode="wait">
            {message.text && step !== "SUCCESS" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-xl text-[14px] font-medium text-center ${
                  message.type === "success" 
                    ? "bg-blue-50 text-blue-600" 
                    : "bg-red-50 text-red-500"
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 메인 폼 영역 */}
          <div className="min-h-[220px] flex flex-col">
            {step === "EMAIL" && (
              <form onSubmit={handleSendOtp} className="space-y-8">
                <InputField
                  label="이메일 주소"
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={emailError}
                />
                <CTAButton 
                  type="submit" 
                  loading={loading} 
                  disabled={!email || !!emailError}
                >
                  인증번호 받기
                </CTAButton>
              </form>
            )}

            {step === "OTP" && (
              <form onSubmit={handleVerifyOtp} className="space-y-8">
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
                <div className="space-y-4">
                  <CTAButton 
                    type="submit" 
                    loading={loading} 
                    disabled={otp.length !== 6}
                  >
                    인증하기
                  </CTAButton>
                  <button
                    type="button"
                    onClick={() => setStep("EMAIL")}
                    className="w-full text-sm text-(--text-tertiary) hover:underline"
                  >
                    이메일 주소 재입력
                  </button>
                </div>
              </form>
            )}

            {step === "NEW_PASSWORD" && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <InputField
                  label="새 비밀번호"
                  name="newPassword"
                  type="password"
                  placeholder="8자 이상 입력"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={passwordError}
                />
                <InputField
                  label="비밀번호 확인"
                  name="confirmPassword"
                  type="password"
                  placeholder="다시 입력"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={matchError}
                />
                <div className="pt-2">
                  <CTAButton 
                    type="submit" 
                    loading={loading} 
                    disabled={!newPassword || !!passwordError || !!matchError}
                  >
                    비밀번호 변경하기
                  </CTAButton>
                </div>
              </form>
            )}

            {step === "SUCCESS" && (
              <div className="space-y-6 flex flex-col items-center justify-center pt-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3">
                    <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <CTAButton onClick={() => window.location.href = '/login'}>
                  로그인하러 가기
                </CTAButton>
              </div>
            )}
          </div>

          {/* 하단 푸터 링크 */}
          {step === "EMAIL" && (
            <div className="flex justify-center items-center gap-4 border-t border-(--border) pt-8">
              <TextLinkButton text="로그인으로 돌아가기" href="/login" />
              <div className="w-px h-3 bg-(--border)" />
              <TextLinkButton text="회원가입" href="/signup" />
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}