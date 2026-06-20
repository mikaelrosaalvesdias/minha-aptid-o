import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "aptidao_admin";

function configuredPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function tokenForPassword(password: string) {
  return crypto.createHmac("sha256", password).update("mapa-de-aptidao-admin").digest("hex");
}

export function adminIsConfigured() {
  return configuredPassword().length >= 8;
}

export function verifyAdminPassword(password: string) {
  const expected = configuredPassword();
  if (!expected) return false;
  return crypto.timingSafeEqual(Buffer.from(tokenForPassword(password)), Buffer.from(tokenForPassword(expected)));
}

export async function createAdminCookie() {
  const password = configuredPassword();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, tokenForPassword(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/"
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

export async function isAdminAuthenticated() {
  const password = configuredPassword();
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  return Boolean(password && cookie && cookie === tokenForPassword(password));
}
