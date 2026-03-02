"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Card from "../components/card";
import CTAButton from "../components/cta_button";
import IconButton from "../components/icon_button";
import InputField from "../components/inputfield";
import SegmentButtonGroup from "../components/segment_button_group_props";

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

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    student_id: "",
    class: "",
    gender: GENDER_OPTIONS[0].value,
    category: CATEGORY_OPTIONS[0].value,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenderSelect = (val: string) => {
    setForm((prev) => ({ ...prev, gender: val }));
  };

  const handleCategorySelect = (val: string) => {
    setForm((prev) => ({ ...prev, category: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setMessage("회원가입 실패: " + (data.error || "알 수 없는 오류"));
      }
    } catch {
      setMessage("회원가입 실패: 네트워크 오류");
    }
    setLoading(false);
  };

  // 뒤로가기 버튼 클릭
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/"); // 이전 페이지 없으면 홈으로
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background px-5 flex justify-center items-center font-pretendard"
    >
      <Card>
        {/* Header */}
        <div className="flex items-center justify-center mb-8 relative">
          {/* 좌측에 아이콘 버튼 */}
          <div className="absolute left-0">
            <IconButton label="←" onClick={handleBack} />
          </div>

          {/* 가운데에 헤더 텍스트 */}
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            회원가입
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
    autoComplete="new-password"
  />
  <InputField
    type="text"
    name="name"
    placeholder="이름"
    value={form.name}
    onChange={handleChange}
    autoComplete="name"
  />
  <InputField
    type="text"
    name="student_id"
    placeholder="학번"
    value={form.student_id}
    onChange={handleChange}
    autoComplete="off"
  />
  <InputField
    type="text"
    name="class"
    placeholder="반"
    value={form.class}
    onChange={handleChange}
    autoComplete="off"
  />
  <SegmentButtonGroup
    label="성별"
    options={GENDER_OPTIONS}
    selected={form.gender}
    onSelect={handleGenderSelect}
  />
  <SegmentButtonGroup
    label="카테고리"
    options={CATEGORY_OPTIONS}
    selected={form.category}
    onSelect={handleCategorySelect}
  />

  {/* 에러 메시지 표시 */}
  {message && (
    <p className="text-sm text-red-500 text-center">{message}</p>
  )}

  <div className="h-4" />
  <CTAButton
    loading={loading}
    disabled={
      loading ||
      !form.email ||
      !form.password ||
      !form.name ||
      !form.student_id ||
      !form.class
    }
  >
    회원가입
  </CTAButton>
</form>
      </Card>
    </motion.div>
  );
}