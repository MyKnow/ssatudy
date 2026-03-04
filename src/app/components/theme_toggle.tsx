"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  // 2. 서버 사이드 렌더링(SSR) 중이거나 마운트 전이면
  // 레이아웃이 깨지지 않도록 투명한 버튼이나 빈 공간을 렌더링합니다.
  if (!mounted) {
    return <div className="p-3 w-24 h-9" /> // 버튼 크기만큼 공간 확보
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="text-link-button transition-all duration-200"
      aria-label="다크모드 전환"
    >
      {theme === "dark" ? "☀️ 라이트" : "🌙 다크"}
    </button>
  )
}