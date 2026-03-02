"use client";
import * as React from "react";

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md p-8 bg-surface rounded-2xl shadow-lg font-pretendard">
      {children}
    </div>
  );
}