// lib/siweServerActions.ts
"use server";

import { SiweMessage, generateNonce } from "siwe";
import { cookies } from "next/headers";

// Generate a nonce and set it in an HTTP-only cookie
export async function getNonce() {
  const nonce = generateNonce();

  cookies().set({
    name: "siwe-nonce",
    value: nonce,
    httpOnly: true,
    maxAge: 15 * 60, // 15 minutes
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return nonce;
}

// Verify the SIWE message and signature
export async function verifyMessage(message: string, signature: string) {
  try {
    const storedNonce = cookies().get("siwe-nonce")?.value;

    if (!storedNonce) {
      return { ok: false, error: "Invalid nonce" };
    }

    const siweMessage = new SiweMessage(message);
    const { success, error } = await siweMessage.verify({
      signature,
      nonce: storedNonce,
    });

    if (!success) {
      return { ok: false, error: error?.type || "Invalid signature" };
    }

    // Store session information in a cookie
    cookies().set({
      name: "siwe-session",
      value: JSON.stringify({ address: siweMessage.address }),
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    // Delete the nonce cookie
    cookies().delete("siwe-nonce");

    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

// Get the current user session
export async function getSession() {
  const sessionCookie = cookies().get("siwe-session")?.value;

  if (!sessionCookie) {
    return { authenticated: false };
  }

  try {
    const session = JSON.parse(sessionCookie);
    return { authenticated: true, address: session.address };
  } catch {
    // Clear invalid session
    cookies().delete("siwe-session");
    return { authenticated: false };
  }
}

// Sign out the user by deleting the session cookie
export async function signOut() {
  cookies().delete("siwe-session");
}
