/** * @id: CONFIG_TAILWIND_V2
 * @description: Toss Style (TDS) 기반 최적화 설정
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/app/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // 토스 블루 (Primary)
        primary: {
          DEFAULT: '#3182F6',
          dark: '#1B64DA',
          light: '#E8F1FF',
        },
        // 토스 그레이 스케일 (텍스트 및 배경용)
        toss: {
          blue: '#3182F6',
          gray: {
            50: '#F2F4F6',  // 전체 배경색
            100: '#F9FAF1', 
            200: '#E5E8EB', // 보더, 구분선
            300: '#D1D6DB',
            400: '#B0B8C1',
            500: '#8B95A1', // 보조 텍스트
            600: '#6B7684',
            700: '#4E5968', // 본문 텍스트
            800: '#333D4B',
            900: '#191F28', // 헤드라인 텍스트
          }
        },
        // 시맨틱 컬러 매핑
        background: '#F2F4F6',
        surface: '#FFFFFF',
      },
      fontFamily: {
        // Pretendard를 기본 산세리프 폰트로 설정
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        // 토스 특유의 큰 곡률 (Squircle 느낌)
        'large': '1.5rem',  // 24px (카드 등)
        'medium': '1rem',   // 16px (버튼, 입력창 등)
        'small': '0.75rem', // 12px
      },
      boxShadow: {
        // 매우 은은한 그림자
        'toss': '0 8px 30px 0 rgba(0, 0, 0, 0.04)',
      },
    },
  },
  // 다크모드는 MVP 이후를 고려해 유지하되, 
  // 기본적으로 토스 스타일의 '라이트 모드' 경험에 집중합니다.
  darkMode: 'class', 
  plugins: [],
}