/**
 * @id: API_HOME_DATA_FETCH_V1
 * @description: 사용자의 팀 정보 및 빙고판 현황을 한 번에 가져오는 로직
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

  // [Guard] 소속된 팀이 없는 경우
  if (!userData.team_id) {
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
    .select("id, name, student_id, gender, category")
    .eq("team_id", userData.team_id);

  // 3. 빙고판 및 제출 현황 가져오기
  // bingo_cells 전체와 해당 팀의 submission을 조인하여 가져옵니다.
  const { data: bingoStatus, error: bingoError } = await supabase
    .from("bingo_cells")
    .select(`
      *,
      submission:submission(
        id,
        image_url,
        approved,
        user_id
      )
    `)
    .eq("submission.team_id", userData.team_id) // 내 팀의 제출건만 필터링
    .order("position", { ascending: true });

  if (memberError || bingoError) throw new Error("데이터 로드 중 오류 발생");

  return {
    user: userData,
    team: userData.teams,
    members,
    bingoStatus // 총 9개의 셀 정보와 각 셀의 제출 상태가 담김
  };
}