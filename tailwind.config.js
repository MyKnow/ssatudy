/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // 경로를 src 전체로 넓혀서 누락 방지
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 기존 TDS 기반 컬러를 CSS 변수와 매핑
        primary: {
          DEFAULT: "var(--primary)",      // #3182F6
          dark: "var(--primary-dark)",    // #1B64DA
          light: "var(--primary-light)",  // #E8F1FF
        },
        // 시맨틱 컬러 (다크모드 대응의 핵심)
        background: "var(--background)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        border: "var(--border)",
        text: {
          primary: "var(--text-primary)",   // #191F28 (Light) / #F2F4F6 (Dark)
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        status: {
          error: "var(--status-error)",
        }
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'large': '1.5rem',  // 24px
        'medium': '1rem',   // 16px
        'small': '0.75rem', // 12px
      },
      boxShadow: {
        'toss': '0 8px 30px 0 rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}