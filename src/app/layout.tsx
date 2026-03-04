// app/layout.tsx

import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SSATUDY | 함께 성장하는 스터디",
    template: "%s | SSATUDY",
  },
  description: "싸피생들을 위한 스터디 모집 및 관리 플랫폼",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
