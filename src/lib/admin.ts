import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Every admin page and server action calls this.
 * Unauthenticated hits are redirected to the login page.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session;
}
