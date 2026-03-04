"use server";

import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

// 1. 팀 생성/수정 (Upsert)
export async function upsertTeam(teamData: { id?: string; name: string; description?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !isAdmin(user.email)) throw new Error("Unauthorized");

  const { error } = await supabaseAdmin.from("teams").upsert(teamData);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/teams");
}

// 2. 팀 삭제
export async function deleteTeam(teamId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !isAdmin(user.email)) throw new Error("Unauthorized");

  // 팀 삭제 시 해당 팀에 소속된 유저들의 team_id는 NULL이 되어야 함 (DB 설정에 따라 자동 처리 가능)
  const { error } = await supabaseAdmin.from("teams").delete().eq("id", teamId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/teams");
}

// 3. 자동 매칭 RPC 실행
export async function runAutoMatchRPC() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !isAdmin(user.email)) throw new Error("Unauthorized");

  const { error } = await supabaseAdmin.rpc("fn_auto_match_teams");
  if (error) throw new Error(error.message);

  revalidatePath("/admin/teams");
  revalidatePath("/admin/users");
}