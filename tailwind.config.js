/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3182F6',
        background: '#F2F4F6',
        surface: '#FFFFFF',
        textPrimary: '#191F28',
        textSecondary: '#8B95A1',
        border: '#E5E8EB',
        borderPrimary: '#3182F6',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      backgroundColor: theme => ({
        light: theme('colors.background'),
        dark: '#191F28',
        surface: theme('colors.surface'),
        primary: theme('colors.primary'),
      }),
      textColor: theme => ({
        light: theme('colors.textPrimary'),
        dark: '#F2F4F6',
        textPrimary: theme('colors.textPrimary'),
        textSecondary: theme('colors.textSecondary'),
      }),
    },
  },
  darkMode: 'class',
  plugins: [],
}
