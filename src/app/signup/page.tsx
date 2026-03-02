/**
 * @id: PAGES_SIGNUP_FULL_V4
 * @description: 최신 Tailwind v4 문법 및 UX 개선(최초 진입 시 에러 미노출)이 적용된 전체 코드
 * @last_modified: 2026-03-02
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Card from "../components/card";
import CTAButton from "../components/cta_button";
import IconButton from "../components/icon_button";
import InputField from "../components/inputfield";
import SegmentButtonGroup from "../components/segment_button_group_props";

// 상수 정의
const GENDER_OPTIONS = [
  { value: "male", label: "남" },
  { value: "female", label: "여" },
];

const CATEGORY_OPTIONS = [
  { value: "algorithm", label: "알고리즘" },
  { value: "cs", label: "CS" },
  { value: "interview", label: "인터뷰" },
];

export default function SignupPage() {
  const router = useRouter();

  // 1. 폼 상태 관리
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    student_id: "",
    class: "",
    gender: GENDER_OPTIONS[0].value,
    category: CATEGORY_OPTIONS[0].value,
  });

  // 2. UX 상태 관리: 필드 터치 여부 및 로딩/메시지
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 3. 실시간 유효성 검사 (useMemo로 성능 최적화)
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    // 이메일 검사
    if (form.email && !form.email.includes("@")) {
      errs.email = "이메일 형식이 올바르지 않습니다.";
    }
    // 비밀번호 검사
    if (form.password && form.password.length < 6) {
      errs.password = "비밀번호는 6자리 이상이어야 합니다.";
    }
    // 이름 검사
    if (touched.name && !form.name) {
      errs.name = "이름을 입력해주세요.";
    }
    // 반 검사 (1~20)
    if (form.class) {
      const classNum = parseInt(form.class);
      if (isNaN(classNum) || classNum < 1 || classNum > 20) {
        errs.class = "1~20반 사이로 입력해주세요.";
      }
    }
    // 학번 검사 (15로 시작하는 7자리)
    if (form.student_id) {
      const idPattern = /^15\d{5}$/;
      if (!idPattern.test(form.student_id)) {
        errs.student_id = "15로 시작하는 7자리 학번을 입력해주세요.";
      }
    }

    return errs;
  }, [form, touched]);

  // 4. 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 학번과 반은 숫자만 입력 가능하도록 제어
    if (name === "student_id" || name === "class") {
      const onlyNum = value.replace(/[^0-9]/g, "");
      setForm((prev) => ({ ...prev, [name]: onlyNum }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    // 입력 시 해당 필드를 touched 상태로 기록
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  // 5. 전체 폼 유효성 여부
  const isFormValid = useMemo(() => {
    return (
      Object.keys(errors).length === 0 &&
      form.email !== "" &&
      form.password !== "" &&
      form.name !== "" &&
      form.student_id.length === 7 &&
      form.class !== ""
    );
  }, [errors, form]);

  // 6. 가입 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/login?verifyEmail=true");
      } else {
        // DB 제약 조건에 따른 에러 메시지 처리 (예: 중복 학번)
        if (data.error?.includes("users_student_id_key")) {
          setMessage("이미 가입된 학번입니다.");
        } else {
          setMessage(data.error || "회원가입 중 오류가 발생했습니다.");
        }
      }
    } catch {
      setMessage("네트워크 연결이 원활하지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--background) flex flex-col items-center justify-center px-5 py-10 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="flex flex-col gap-8">
          {/* 상단 헤더 영역 */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-start">
              <IconButton 
                label="←" 
                onClick={() => router.back()} 
                className="-ml-2"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-[26px] font-bold text-(--text-primary) leading-tight tracking-tight">
                스터디 참여를 위해<br />
                정보를 입력해주세요
              </h1>
              <p className="text-[15px] text-(--text-secondary)">
                입력하신 정보는 팀 매칭에 사용됩니다.
              </p>
            </div>
          </div>

          {/* 회원가입 폼 영역 */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* 1. 계정 정보 그룹 */}
            <div className="space-y-4">
              <InputField
                label="이메일"
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={form.email}
                onChange={handleChange}
                error={touched.email ? errors.email : ""}
                autoComplete="email"
              />
              <InputField
                label="비밀번호"
                type="password"
                name="password"
                placeholder="6자리 이상 입력해주세요"
                value={form.password}
                onChange={handleChange}
                error={touched.password ? errors.password : ""}
                autoComplete="new-password"
              />
            </div>

            {/* 구분선 */}
            <div className="h-px bg-(--border) my-2" />

            {/* 2. 인적 사항 그룹 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="이름"
                  type="text"
                  name="name"
                  placeholder="실명 입력"
                  value={form.name}
                  onChange={handleChange}
                  error={touched.name ? errors.name : ""}
                  autoComplete="name"
                />
                <InputField
                  label="반"
                  type="text"
                  name="class"
                  placeholder="1 ~ 20"
                  value={form.class}
                  onChange={handleChange}
                  error={touched.class ? errors.class : ""}
                />
              </div>
              <InputField
                label="학번"
                type="text"
                name="student_id"
                placeholder="15로 시작하는 7자리"
                value={form.student_id}
                onChange={handleChange}
                error={touched.student_id ? errors.student_id : ""}
              />
            </div>

            {/* 3. 선택 사항 그룹 */}
            <div className="space-y-4 pt-2">
              <SegmentButtonGroup
                label="성별"
                options={GENDER_OPTIONS}
                selected={form.gender}
                onSelect={(val) => setForm((p) => ({ ...p, gender: val }))}
              />
              <SegmentButtonGroup
                label="희망 카테고리"
                options={CATEGORY_OPTIONS}
                selected={form.category}
                onSelect={(val) => setForm((p) => ({ ...p, category: val }))}
              />
            </div>

            {/* 에러 메시지 피드백 */}
            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[13px] text-(--status-error) text-center font-medium"
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>

            {/* 제출 버튼 */}
            <div className="pt-4">
              <CTAButton
                loading={loading}
                disabled={!isFormValid || loading}
                type="submit"
              >
                가입하기
              </CTAButton>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}