"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function signInAction(email: string, password: string) {
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Wrong email or password" };
    }
    throw err;
  }
}
