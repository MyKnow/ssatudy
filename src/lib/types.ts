/**
 * @id: TYPES
 * @description: 앱에서 사용하는 기본 타입 정의
 */

export type CategoryType = "algorithm" | "cs" | "interview";
export type GenderType = "male" | "female";

export interface User {
  id: string;
  student_id: string;
  name: string;
  class: string;
  category: CategoryType;
  gender: GenderType;
  team_id: string | null;
}

export interface Team {
  id: string;
  name: string;
  discord_channel_id?: string | null; // 디스코드 연동용 확장
}

// 조인 쿼리용 확장 타입
export interface UserWithTeam extends User {
  teams: Team | null;
}

/**
 * @description: 업데이트된 Submission 인터페이스
 */
export interface Submission {
  id: string;
  team_id: string;
  user_id: string;
  bingo_cell_id: string;
  image_url: string | null;
  image_url_2: string | null;
  description: string | null;
  approved: boolean;
  rejection_reason: string | null;
  created_at: string;
}

/**
 * @description: 빙고 셀 타입 내의 submission 타입도 자동 반영됨
 */
export interface BingoCell {
  id: string;
  team_id: string; // 필수 필드로 변경
  position: number;
  title: string;
  type: string;
  required_count: number; // 추가된 필드
  submission: Submission | null;
}

/** * @description: API 응답용 내부 인터페이스 (DB의 bingo_cells + join된 submissions)
 */
export interface BingoResponse {
  id: string;
  position: number;
  title: string;
  type: string;
  team_id: string;        // 👈 추가됨
  required_count: number; // 👈 추가됨
  submission: Submission[]; // 조인 쿼리 결과는 배열로 옵니다.
  rejection_reason: string | null;
}