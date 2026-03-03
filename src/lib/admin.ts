/**
 * @description 환경변수 기반 관리자 권한 확인 유틸리티
 */

export const isAdmin = (email?: string | null): boolean => {
  if (!email) return false;

  // .env.local에서 이메일 목록을 가져와서 배열로 변환
  // 예: "admin1@test.com,admin2@test.com" -> ["admin1@test.com", "admin2@test.com"]
  const adminEmailsRaw = process.env.ADMIN_EMAILS || "";
  const adminEmails = adminEmailsRaw.split(",").map((e) => e.trim());

  return adminEmails.includes(email);
};