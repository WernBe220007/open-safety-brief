import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";
import { IncidentDetail } from "./db/queries/incident";

// Constants for layout
const PAGE_WIDTH = 595.28;  // A4 width in points
const PAGE_HEIGHT = 841.89; // A4 height in points
const MARGIN_LEFT = 50;
const MARGIN_RIGHT = 50;
const MARGIN_TOP = 50;
const MARGIN_BOTTOM = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

// Colors
const TEXT_COLOR = rgb(0, 0, 0);
const LIGHT_GRAY = rgb(0.9, 0.9, 0.9);
const TABLE_HEADER_BG = rgb(0.3, 0.5, 0.7);
const WHITE = rgb(1, 1, 1);


function formatDate(date: Date): string {
    return date.toLocaleDateString('de-AT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatDateTime(date: Date): string {
    return date.toLocaleDateString('de-AT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }) + ', ' + date.toLocaleTimeString('de-AT', {
        hour: '2-digit',
        minute: '2-digit',
    }) + ' Uhr';
}

async function drawHeader(page: PDFPage, font: PDFFont, boldFont: PDFFont) {
    const headerY = PAGE_HEIGHT - MARGIN_TOP;

    // Draw header rectangle
    page.drawRectangle({
        x: MARGIN_LEFT,
        y: headerY - 40,
        width: CONTENT_WIDTH,
        height: 40,
        color: WHITE,
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 1,
    });

    // Draw organization name box
    page.drawRectangle({
        x: MARGIN_LEFT,
        y: headerY - 40,
        width: 150,
        height: 40,
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 1,
    });

    // Organization name
    page.drawText(process.env.NEXT_PUBLIC_PDF_COMPANY || "FIRMA", {
        x: MARGIN_LEFT + 10,
        y: headerY - 22,
        size: 11,
        font: boldFont,
        color: TEXT_COLOR,
    });
    page.drawText(process.env.NEXT_PUBLIC_PDF_SUBTITLE || 'ADDRESSE', {
        x: MARGIN_LEFT + 10,
        y: headerY - 34,
        size: 8,
        font: font,
        color: TEXT_COLOR,
    });

    // Separator line
    page.drawLine({
        start: { x: MARGIN_LEFT + 155, y: headerY - 10 },
        end: { x: MARGIN_LEFT + 155, y: headerY - 35 },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
    });

    // Title
    page.drawText('Sicherheitsunterweisung', {
        x: MARGIN_LEFT + 170,
        y: headerY - 28,
        size: 14,
        font: boldFont,
        color: TEXT_COLOR,
    });

    return headerY - 60;
}

function drawLabelValue(
    page: PDFPage,
    label: string,
    value: string,
    y: number,
    font: PDFFont,
    boldFont: PDFFont,
    labelWidth: number = 220
): number {
    page.drawText(label, {
        x: MARGIN_LEFT,
        y,
        size: 10,
        font: boldFont,
        color: TEXT_COLOR,
    });

    page.drawText(value, {
        x: MARGIN_LEFT + labelWidth,
        y,
        size: 10,
        font: font,
        color: TEXT_COLOR,
    });

    return y - 18;
}

async function embedSignatureImage(pdfDoc: PDFDocument, page: PDFPage, signatureData: string, x: number, y: number, maxWidth: number, maxHeight: number) {
    try {
        // Check if it's a valid base64 PNG data URL
        if (!signatureData.startsWith('data:image/png;base64,')) {
            return;
        }

        const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        const image = await pdfDoc.embedPng(imageBytes);

        // Scale the image to fit within bounds
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        const width = image.width * scale;
        const height = image.height * scale;

        // Center the signature vertically within the available space
        const yOffset = (maxHeight - height) / 2;

        page.drawImage(image, {
            x,
            y: y + yOffset,
            width,
            height,
        });
    } catch (error) {
        console.error('Failed to embed signature image:', error);
    }
}

export async function generatePDF(incident: IncidentDetail): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // =====================
    // PAGE 1: Incident Details
    // =====================
    const page1 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    let y = await drawHeader(page1, font, boldFont);

    // Section title
    y -= 20;
    page1.drawText('Angaben zur Sicherheitsunterweisung', {
        x: MARGIN_LEFT,
        y,
        size: 14,
        font: boldFont,
        color: TEXT_COLOR,
    });

    y -= 30;

    // Incident details
    y = drawLabelValue(page1, 'Grund der Sicherheitsunterweisung:', incident.reason || '', y, font, boldFont);
    y -= 5;
    y = drawLabelValue(page1, 'Datum und Uhrzeit der Unterweisung:', formatDateTime(incident.date), y, font, boldFont);
    y -= 5;
    y = drawLabelValue(page1, 'Sicherheitsunterweisung für:', incident.department || '', y, font, boldFont);

    y -= 25;

    // Instructor section with signature
    page1.drawText('Durchgeführt von', {
        x: MARGIN_LEFT,
        y,
        size: 10,
        font: boldFont,
        color: TEXT_COLOR,
    });

    page1.drawText('Unterschrift:', {
        x: MARGIN_LEFT + 250,
        y,
        size: 10,
        font: boldFont,
        color: TEXT_COLOR,
    });

    y -= 16;

    page1.drawText(incident.instructor, {
        x: MARGIN_LEFT + 5,
        y,
        size: 10,
        font: font,
        color: TEXT_COLOR,
    });

    // Get instructor signature (first signature in the list, assuming instructor signs first)
    if (incident.signatures.length > 0) {
        const instructorSig = incident.signatures[0];
        await embedSignatureImage(pdfDoc, page1, instructorSig.signature, MARGIN_LEFT + 320, y - 20, 120, 50);
    }

    y -= 50;

    // Topics section
    y -= 20;
    page1.drawText('Folgende Themen wurden besprochen', {
        x: MARGIN_LEFT,
        y,
        size: 12,
        font: boldFont,
        color: TEXT_COLOR,
    });

    y -= 20;

    // List topics
    for (const topicItem of incident.topics) {
        page1.drawText(topicItem.name, {
            x: MARGIN_LEFT,
            y,
            size: 10,
            font: font,
            color: TEXT_COLOR,
        });
        y -= 14;

        // Check if we need a new page
        if (y < MARGIN_BOTTOM + 50) {
            // This should rarely happen, but handle it
            break;
        }
    }

    // =====================
    // PAGE 2: Participants
    // =====================
    const page2 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    y = await drawHeader(page2, font, boldFont);

    // Training aids question
    y -= 20;

    // Participants section title
    page2.drawText('Teilnehmer', {
        x: MARGIN_LEFT,
        y,
        size: 14,
        font: boldFont,
        color: TEXT_COLOR,
    });

    y -= 16;
    page2.drawText('An der Sicherheitsunterweisung teilgenommen haben:', {
        x: MARGIN_LEFT,
        y,
        size: 10,
        font: font,
        color: TEXT_COLOR,
    });

    y -= 20;

    // Table setup
    const tableStartY = y;
    const colWidths = [30, 70, 170, 225];  // Nr, Kurz, Vor-Nachname, Unterschrift
    const rowHeight = 22;

    // Table header
    const headerLabels = ['', 'Kurz', 'Vor- Nachname', 'Unterschrift'];

    // Draw header background
    page2.drawRectangle({
        x: MARGIN_LEFT,
        y: y - rowHeight,
        width: CONTENT_WIDTH,
        height: rowHeight,
        color: TABLE_HEADER_BG,
    });

    // Draw header text
    let xPos = MARGIN_LEFT;
    for (let i = 0; i < headerLabels.length; i++) {
        page2.drawText(headerLabels[i], {
            x: xPos + 5,
            y: y - 15,
            size: 9,
            font: boldFont,
            color: WHITE,
        });
        xPos += colWidths[i];
    }

    y -= rowHeight;

    // Draw participant rows (skip first signature if it's the instructor)
    const participantSignatures = incident.signatures.slice(1); // Skip instructor signature

    for (let i = 0; i < participantSignatures.length; i++) {
        const sig = participantSignatures[i];
        const rowY = y - rowHeight;

        // Alternate row background
        if (i % 2 === 0) {
            page2.drawRectangle({
                x: MARGIN_LEFT,
                y: rowY,
                width: CONTENT_WIDTH,
                height: rowHeight,
                color: LIGHT_GRAY,
            });
        }

        // Draw row data
        xPos = MARGIN_LEFT;

        // Number
        page2.drawText(String(i + 1), {
            x: xPos + 5,
            y: rowY + 7,
            size: 9,
            font: font,
            color: TEXT_COLOR,
        });
        xPos += colWidths[0];

        // Kurz (from email prefix, stored in database)
        page2.drawText(sig.kurz, {
            x: xPos + 5,
            y: rowY + 7,
            size: 9,
            font: font,
            color: TEXT_COLOR,
        });
        xPos += colWidths[1];

        // Full name
        page2.drawText(sig.name, {
            x: xPos + 5,
            y: rowY + 7,
            size: 9,
            font: font,
            color: TEXT_COLOR,
        });
        xPos += colWidths[2];

        // Signature - center vertically in the row
        const sigMaxHeight = rowHeight - 4;
        await embedSignatureImage(pdfDoc, page2, sig.signature, xPos + 5, rowY + 2, colWidths[3] - 10, sigMaxHeight);

        y -= rowHeight;

        // Check if we need a new page
        if (y < MARGIN_BOTTOM + 80) {
            // For now, just stop. Could add pagination logic here.
            break;
        }
    }

    // Draw table border
    const tableEndY = y;
    page2.drawRectangle({
        x: MARGIN_LEFT,
        y: tableEndY,
        width: CONTENT_WIDTH,
        height: tableStartY - tableEndY,
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 1,
    });

    // Draw column lines
    xPos = MARGIN_LEFT;
    for (let i = 0; i < colWidths.length - 1; i++) {
        xPos += colWidths[i];
        page2.drawLine({
            start: { x: xPos, y: tableStartY },
            end: { x: xPos, y: tableEndY },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7),
        });
    }

    // Draw row lines
    let lineY = tableStartY - rowHeight;
    while (lineY > tableEndY) {
        page2.drawLine({
            start: { x: MARGIN_LEFT, y: lineY },
            end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: lineY },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7),
        });
        lineY -= rowHeight;
    }

    // Footer
    const footerY = MARGIN_BOTTOM + 20;

    page2.drawText(`Erstellt am:`, {
        x: MARGIN_LEFT,
        y: footerY + 10,
        size: 8,
        font: boldFont,
        color: TEXT_COLOR,
    });
    page2.drawText(formatDate(incident.date), {
        x: MARGIN_LEFT,
        y: footerY,
        size: 8,
        font: font,
        color: TEXT_COLOR,
    });

    page2.drawText('Absender:', {
        x: MARGIN_LEFT + 150,
        y: footerY + 10,
        size: 8,
        font: boldFont,
        color: TEXT_COLOR,
    });
    page2.drawText('safety@litec.ac.at', {
        x: MARGIN_LEFT + 150,
        y: footerY,
        size: 8,
        font: font,
        color: TEXT_COLOR,
    });

    page2.drawText('Mail an:', {
        x: MARGIN_LEFT + 300,
        y: footerY + 10,
        size: 8,
        font: boldFont,
        color: TEXT_COLOR,
    });
    page2.drawText('wl@litec.ac.at', {
        x: MARGIN_LEFT + 300,
        y: footerY,
        size: 8,
        font: font,
        color: TEXT_COLOR,
    });

    page2.drawText('Mail vom:', {
        x: MARGIN_LEFT + 420,
        y: footerY + 10,
        size: 8,
        font: boldFont,
        color: TEXT_COLOR,
    });
    page2.drawText(formatDate(incident.date), {
        x: MARGIN_LEFT + 420,
        y: footerY,
        size: 8,
        font: font,
        color: TEXT_COLOR,
    });

    const bytes = await pdfDoc.save();
    return bytes;
}