import type { NextRequest, NextResponse } from "next/server";

export const anonymousIdCookieName = "itna_anonymous_id";

const anonymousIdMaxAgeSeconds = 60 * 60 * 24 * 365;

export function getAnonymousId(request: NextRequest) {
  return request.cookies.get(anonymousIdCookieName)?.value ?? crypto.randomUUID();
}

export function persistAnonymousId(response: NextResponse, anonymousId: string) {
  response.cookies.set(anonymousIdCookieName, anonymousId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: anonymousIdMaxAgeSeconds,
  });
}
