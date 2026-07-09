import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";

export async function canAccessResult(resultId: string, ownerId: string | null) {
  const userId = await getSession();
  if (ownerId) return userId === ownerId;

  const cookieStore = await cookies();
  return cookieStore.get("guest_result_id")?.value === resultId;
}
