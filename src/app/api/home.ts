/**
 * @id: API_HOME_DATA_FETCH_V2
 * @description: 사용자의 팀 정보 및 팀 전용 빙고판 현황을 가져오는 로직
 */

import { supabase } from "@/lib/supabaseClient";

export async function getHomeData(userId: string) {
  // 1. 내 상세 정보 및 소속 팀 확인
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*, teams(*)")
    .eq("id", userId)
    .single();

  if (userError || !userData) throw new Error("사용자 정보를 찾을 수 없습니다.");

  const teamId = userData.team_id;

  // [Guard] 소속된 팀이 없는 경우
  if (!teamId) {
    return {
      user: userData,
      team: null,
      members: [],
      bingoStatus: []
    };
  }

  // 2. 같은 팀원들 정보 가져오기
  const { data: members, error: memberError } = await supabase
    .from("users")
    .select("id, name, student_id, gender, category, class")
    .eq("team_id", teamId);

  // 3. [핵심 수정] 내 팀의 전용 빙고판(0~8번)과 제출 현황 가져오기
  const { data: bingoStatus, error: bingoError } = await supabase
    .from("bingo_cells")
    .select(`
      id,
      position,
      title,
      type,
      team_id,
      submission:submissions(
        id,
        image_url,
        approved,
        user_id
      )
    `)
    .eq("team_id", teamId) // ✅ 이제 bingo_cells 테이블에 있는 team_id로 직접 필터링합니다.
    .order("position", { ascending: true });

  if (memberError || bingoError) {
    console.error("Data fetch error:", memberError || bingoError);
    throw new Error("데이터 로드 중 오류가 발생했습니다.");
  }

  return {
    user: userData,
    team: userData.teams,
    members,
    bingoStatus // 내 팀 전용 9개의 셀 정보
  };
}