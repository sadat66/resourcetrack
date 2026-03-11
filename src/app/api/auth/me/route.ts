import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ user: null }, { status: 200 });
  await connectDB();
  const user = await User.findById(userId).select("email _id").lean() as { _id: unknown; email: string } | null;
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user: { id: String(user._id), email: user.email } });
}
