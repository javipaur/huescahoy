import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionExists } from "./db";

export const SESSION_COOKIE = "admin_session";

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  if (!(await sessionExists(token))) return null;
  return token;
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}

export async function requireAuth(): Promise<string> {
  const token = await getSession();
  if (!token) redirect("/admin/login");
  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  if (token) cookieStore.delete(SESSION_COOKIE);
  return token;
}
