import { NextResponse } from "next/server";
import { getUser } from "@/lib/server/session";

const MAX_SIZE = 5 * 1024 * 1024;

// Runs on the server so the imgbb API key is never sent to the browser
export async function POST(request: Request) {
  if (!(await getUser())) {
    return NextResponse.json({ message: "Please log in to upload images." }, { status: 401 });
  }
  const key = process.env.IMGBB_API_KEY;
  if (!key) {
    return NextResponse.json({ message: "Image upload is not set up yet. Please paste an image URL." }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ message: "Please choose an image file." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ message: "Image must be smaller than 5 MB." }, { status: 400 });
  }

  const body = new FormData();
  body.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: "POST", body });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.data?.url) {
    return NextResponse.json({ message: "Upload failed. Please try again or paste an image URL." }, { status: 502 });
  }
  return NextResponse.json({ url: data.data.url });
}
