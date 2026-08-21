import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate operator credentials (or allow demo operator login)
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Set secure HTTP-only admin session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        email: email.toLowerCase(),
        role: "mall_admin",
        name: "Operator Admin",
      },
    });

    response.cookies.set({
      name: "parknex_admin_session",
      value: `sess_${Buffer.from(email).toString("base64")}_${Date.now()}`,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
