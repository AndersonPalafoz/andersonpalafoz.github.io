import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { materials } from "@/drizzle/schema";

export async function GET() {
  try {
    const materialList = await db.select().from(materials).limit(100);
    return NextResponse.json(materialList);
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}
