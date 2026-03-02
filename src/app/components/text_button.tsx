"use client";

import { useRouter } from "next/navigation";

interface TextLinkButtonProps {
  text: string;
  href: string;
  className?: string;
}

export default function TextLinkButton({ text, href, className }: TextLinkButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={`text-link-button ${className || ""}`}
      onClick={() => router.push(href)}
    >
      {text}
    </button>
  );
}