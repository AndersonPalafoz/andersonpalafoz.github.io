import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { lessonNotes } from "@/drizzle/schema";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);
  if (!Number.isInteger(userId) || userId <= 0) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  const notes = await db.query.lessonNotes.findMany({ where: eq(lessonNotes.userId, userId), with: { lesson: true }, orderBy: (table, { desc }) => desc(table.updatedAt) });
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595, 842]);
  let y = 790;
  const addPage = () => { page = pdf.addPage([595, 842]); y = 790; };
  const draw = (text: string, options: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> } = {}) => { const size = options.size || 11; const selected = options.bold ? bold : font; const lines = text.match(/.{1,88}(?:\s|$)/g) || [text]; for (const line of lines) { if (y < 55) addPage(); page.drawText(line.trim(), { x: 50, y, size, font: selected, color: options.color || rgb(0.12, 0.12, 0.12) }); y -= size + 5; } };
  draw("Minhas anotações de estudo", { size: 20, bold: true, color: rgb(0.72, 0.05, 0.08) }); y -= 12;
  if (!notes.length) draw("Nenhuma anotação foi registrada.");
  for (const note of notes) { if (y < 120) addPage(); draw(note.lesson?.title || `Aula #${note.lessonId}`, { size: 13, bold: true }); draw(`Atualizada em ${new Date(note.updatedAt).toLocaleString("pt-BR")}`, { size: 9, color: rgb(0.4, 0.4, 0.4) }); y -= 5; draw(note.note || "(anotação vazia)"); y -= 18; }
  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename= minhas-anotacoes.pdf" } });
}
