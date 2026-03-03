export type CategoryType = "algorithm" | "cs" | "interview";
export type GenderType = "male" | "female"; // DB의 gender_type과 일치시켜주세요

export interface User {
  id: string; // uuid
  student_id: string;
  name: string;
  class: string;
  category: CategoryType;
  gender: GenderType; // 필수 필드
  team_id: string | null;
}

export interface Team {
  id: string;
  name: string;
}