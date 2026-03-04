"use client";

import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  title: string;
  backPath?: string; // 기본값은 /admin
}

export default function AdminHeader({ title, backPath = "/admin" }: AdminHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => router.push(backPath)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
        aria-label="뒤로 가기"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <h1 className="text-xl font-black text-gray-900 tracking-tight italic uppercase">
        {title}
      </h1>
    </div>
  );
}