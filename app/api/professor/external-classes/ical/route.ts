import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { externalClasses } from "@/drizzle/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "super_admin", "professor"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const classes = await db.select().from(externalClasses).orderBy(desc(externalClasses.createdAt));

    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Anderson Palafoz Platform//External Classes//PT\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";

    for (const item of classes) {
      const summary = encodeURIComponent(`${item.className} (${item.institution})`);
      const location = item.classroomLocation || item.meetingLink || "Online";
      const description = encodeURIComponent(`Modalidade: ${item.modality}. Dias: ${item.classDays}. Horário: ${item.classTime}. Local/Link: ${location}`);
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `UID:external-class-${item.id}@andersonpalafoz.vercel.app\n`;
      icsContent += `SUMMARY:${item.className} - ${item.institution}\n`;
      icsContent += `DESCRIPTION:Modalidade: ${item.modality} \\n Dias: ${item.classDays} \
 Horario: ${item.classTime} \
 Local: ${location}\n`;
      icsContent += `LOCATION:${location}\n`;
      icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z\n`;
      icsContent += `DTSTART:${new Date(item.startDate || Date.now()).toISOString().replace(/[-:]/g, "").split(".")[0]}Z\n`;
      icsContent += `DTEND:${new Date(item.endDate || Date.now()).toISOString().replace(/[-:]/g, "").split(".")[0]}Z\n`;
      icsContent += "END:VEVENT\n";
    }

    icsContent += "END:VCALENDAR";

    return new NextResponse(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"turmas-externas-anderson-palafoz.ics\"",
      },
    });
  } catch (error) {
    console.error("Error generating iCal:", error);
    return NextResponse.json({ error: "Erro ao gerar arquivo iCal." }, { status: 500 });
  }
}
