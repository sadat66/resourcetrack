import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!email.trim() || !password.trim()) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    await connectDB();
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true, userId: user._id.toString() });
    const cookie = getSessionCookie(user._id.toString());
    res.cookies.set(cookie.name, cookie.value, cookie.options as Record<string, string | number | boolean>);
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Login failed";
    console.error("Login error:", e);
    if (message === "Database not configured") {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
