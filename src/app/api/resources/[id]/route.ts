import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUserId } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Resource from "@/models/Resource";
import { getYoutubeThumbnail } from "@/lib/youtube";

type ResourceDoc = {
  _id: { toString(): string };
  title: string;
  url: string;
  type: string;
  section?: string;
  done: boolean;
};

function toResourceJson(r: ResourceDoc) {
  const section = r.section ?? "other";
  const thumbnail = r.type === "youtube" ? getYoutubeThumbnail(r.url) : null;
  return {
    id: r._id.toString(),
    title: r.title,
    url: r.url,
    type: r.type,
    section,
    thumbnail,
    done: r.done,
  };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const done = body.done === true || body.done === false ? body.done : undefined;
  const validSections = ["frontend", "backend", "database", "fundamentals", "interview-prep", "other"];
  const section =
    typeof body.section === "string" && validSections.includes(body.section)
      ? body.section
      : undefined;
  await connectDB();
  const set: Record<string, unknown> = {};
  if (done !== undefined) set.done = done;
  if (section !== undefined) set.section = section;
  const update = Object.keys(set).length > 0 ? { $set: set } : {};
  const resource = await Resource.findOneAndUpdate(
    { _id: id, userId },
    update,
    { new: true }
  ).lean() as ResourceDoc | null;
  if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toResourceJson(resource));
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await connectDB();
  const deleted = await Resource.findOneAndDelete({ _id: id, userId });
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
