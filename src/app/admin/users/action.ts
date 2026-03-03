"use server";

import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { User } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function updateAllUsers(usersData: User[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email || !isAdmin(user.email)) {
    throw new Error("권한이 없습니다.");
  }

  // 💡 신규 유저(temp- ID)를 제외하고 실제 DB에 존재하는 유저만 필터링합니다.
  const updates = usersData
    .filter(u => !u.id.startsWith("temp-")) 
    .map((u) => ({
      id: u.id,
      name: u.name,
      student_id: u.student_id,
      class: u.class,
      gender: u.gender,
      category: u.category,
      team_id: u.team_id === "none" ? null : u.team_id,
    }));

  if (updates.length === 0) return { success: true };

  const { error } = await supabaseAdmin.from("users").upsert(updates);
  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUserAdmin(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email || !isAdmin(user.email)) throw new Error("Unauthorized");

  const { error } = await supabaseAdmin.from("users").delete().eq("id", userId);
  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/users");
}