import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles } from "@/drizzle/schema";

export async function GET() {
  try {
    const articleList = await db.select().from(articles).limit(100);
    return NextResponse.json(articleList);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
