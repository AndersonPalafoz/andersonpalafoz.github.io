import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type PdfTableRow = Array<string | number>;

function wrapText(text: string, maxLength: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function createTablePdf(title: string, headers: string[], rows: PdfTableRow[]) {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 842;
  const pageHeight = 595;
  const margin = 40;
  const columnWidth = (pageWidth - margin * 2) / headers.length;
  let page = document.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const addPage = () => {
    page = document.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  };

  page.drawText(title, { x: margin, y, size: 18, font: bold, color: rgb(0.15, 0.15, 0.18) });
  y -= 28;
  page.drawText(`Gerado em ${new Date().toLocaleString("pt-BR")}`, { x: margin, y, size: 8, font: regular, color: rgb(0.4, 0.4, 0.45) });
  y -= 24;

  const drawRow = (values: PdfTableRow, isHeader = false) => {
    const linesByColumn = values.map((value) => wrapText(String(value ?? ""), Math.max(12, Math.floor(columnWidth / 5.1))));
    const lineCount = Math.max(...linesByColumn.map((lines) => lines.length));
    const rowHeight = Math.max(22, lineCount * 11 + 8);
    if (y - rowHeight < margin) addPage();
    if (isHeader) page.drawRectangle({ x: margin, y: y - rowHeight + 2, width: pageWidth - margin * 2, height: rowHeight, color: rgb(0.88, 0.1, 0.12) });
    for (let column = 0; column < values.length; column += 1) {
      const lines = linesByColumn[column];
      lines.forEach((line, index) => page.drawText(line, {
        x: margin + column * columnWidth + 4,
        y: y - 14 - index * 11,
        size: isHeader ? 8 : 7.5,
        font: isHeader ? bold : regular,
        color: isHeader ? rgb(1, 1, 1) : rgb(0.18, 0.18, 0.2),
      }));
      page.drawLine({ start: { x: margin + column * columnWidth, y: y + 2 }, end: { x: margin + column * columnWidth, y: y - rowHeight + 2 }, thickness: 0.4, color: rgb(0.82, 0.82, 0.84) });
    }
    page.drawLine({ start: { x: margin, y: y - rowHeight + 2 }, end: { x: pageWidth - margin, y: y - rowHeight + 2 }, thickness: 0.4, color: rgb(0.82, 0.82, 0.84) });
    y -= rowHeight;
  };

  drawRow(headers, true);
  rows.forEach((row) => drawRow(row));
  return document.save();
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
