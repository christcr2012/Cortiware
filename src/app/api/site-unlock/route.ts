// src/app/api/site-unlock/route.ts
import { NextRequest, NextResponse } from "next/server";

const PROTECTION_COOKIE_NAME = "site_access_granted";
const PROTECTION_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const expectedPassword = process.env.SITE_PROTECTION_PASSWORD || "test123";

    if (password === expectedPassword) {
      const response = NextResponse.json({ success: true });
      
      response.cookies.set(PROTECTION_COOKIE_NAME, password, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: PROTECTION_COOKIE_MAX_AGE,
        path: "/",
      });
      
      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}

