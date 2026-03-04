import { supabaseAdmin } from "@/lib/supabaseAdmin";
import TeamManagementClient from "./team_management_client";

export default async function AdminTeamsPage() {
  // 팀 정보와 해당 팀에 속한 유저 리스트를 한꺼번에 가져옵니다.
  const { data: teams, error } = await supabaseAdmin
    .from("teams")
    .select(`
      *,
      users (
        id,
        name,
        class,
        gender,
        category
      )
    `)
    .order("name", { ascending: true });

  if (error) return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>;

  return <TeamManagementClient teams={teams || []} />;
}