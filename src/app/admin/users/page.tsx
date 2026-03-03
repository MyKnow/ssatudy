import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { Team, User } from "@/lib/types";
import { redirect } from "next/navigation";
import UserManagementClient from "./user_management_client";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // 1. 권한 체크 (실패 시 즉시 홈으로)
  if (!user || !user.email || !isAdmin(user.email)) {
    console.error("Admin Access Denied:", user?.email, authError?.message);
    redirect("/");
  }

  // 2. 데이터 병렬 로딩 (안전한 기본값 처리)
  const [usersRes, teamsRes] = await Promise.all([
    supabaseAdmin.from("users").select("*").order("name"),
    supabaseAdmin.from("teams").select("id, name").order("name")
  ]);

  const initialUsers: User[] = usersRes.data ?? [];
  const teams: Team[] = teamsRes.data ?? [];

  return (
    <UserManagementClient 
      initialUsers={initialUsers} 
      teams={teams} 
    />
  );
}