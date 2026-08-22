import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { adminActivityLogs } from "@/drizzle/schema";
import { desc, count } from "drizzle-orm";

export const dynamic = "force-dynamic";
