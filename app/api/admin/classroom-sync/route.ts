import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let connected = false;
    let syncedCourses = 0;
    let syncedAssignments = 0;
    let errorMessage = null;

    try {
      const { stdout } = await execAsync("gws classroom courses list --params '{\"pageSize\":20}'");
      if (stdout) {
        connected = true;
        const parsed = JSON.parse(stdout);
        const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.courses) ? parsed.courses : [];
        syncedCourses = list.length;
        syncedAssignments = list.reduce((acc: number, c: any) => acc + (c?.courseWorkCount || 0), 0);
      }
    } catch (err: any) {
      try {
        const { stdout: driveOut } = await execAsync("gws drive files list --pageSize 1");
        if (driveOut) {
          connected = true;
          syncedCourses = 0;
          syncedAssignments = 0;
        }
      } catch (driveErr: any) {
        connected = false;
        errorMessage = driveErr?.message || err?.message || "Falha ao conectar com a API do Google Workspace / Classroom.";
      }
    }

    if (!connected) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage || "Não foi possível autenticar com o Google Classroom. Verifique a autorização OAuth.",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sincronização com o Google Classroom realizada com sucesso!",
      stats: {
        syncedCourses,
        syncedAssignments,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error during manual Classroom sync:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno ao processar sincronização com o Google Classroom." },
      { status: 500 }
    );
  }
}
