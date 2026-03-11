import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Resource from "@/models/Resource";
import { getYoutubeThumbnail } from "@/lib/youtube";

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}

type ResourceDoc = {
  _id: unknown;
  title: string;
  url: string;
  type: string;
  section?: string;
  done: boolean;
  createdAt?: unknown;
};

function toResourceJson(r: ResourceDoc) {
  const section = r.section ?? "other";
  const thumbnail = r.type === "youtube" ? getYoutubeThumbnail(r.url) : null;
  return {
    id: String(r._id),
    title: r.title,
    url: r.url,
    type: r.type,
    section,
    thumbnail,
    done: r.done,
    createdAt: r.createdAt,
  };
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const list = (await Resource.find({ userId }).sort({ createdAt: -1 }).lean()) as unknown as ResourceDoc[];
  return NextResponse.json(list.map(toResourceJson));
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, url, section } = await req.json();
  if (!title?.trim() || !url?.trim()) {
    return NextResponse.json({ error: "Title and URL required" }, { status: 400 });
  }
  const validSections = ["frontend", "backend", "database", "fundamentals", "interview-prep", "other"];
  const sectionValue = validSections.includes(section) ? section : "other";
  await connectDB();
  const type = isYouTubeUrl(url) ? "youtube" : "link";
  const resource = await Resource.create({
    userId,
    title: title.trim(),
    url: url.trim(),
    type,
    section: sectionValue,
  });
  return NextResponse.json(toResourceJson(resource.toObject() as ResourceDoc));
}
