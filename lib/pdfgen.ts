import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generatePDF() {
    const pdfDoc = await PDFDocument.create();
    const bytes = await pdfDoc.save();
    return bytes;
}