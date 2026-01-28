import jsPDF from "jspdf";

/**
 * RGB tuple type (IMPORTANT!)
 */
export type RGB = [number, number, number];

/**
 * Shared colors
 */
export const COLORS: Record<string, RGB> = {
    primary: [15, 23, 42],
    accent: [59, 130, 246],
    success: [22, 163, 74],
    danger: [220, 38, 38],
    text: [51, 65, 85],
    lightBg: [248, 250, 252],
};

/**
 * Shared header
 */
export const drawCorporateHeader = (
    doc: jsPDF,
    title: string,
    subtitle?: string
) => {
    const pageWidth = doc.internal.pageSize.width;

    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, 5, "F");

    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 25);

    if (subtitle) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(subtitle, 14, 32);
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 40, pageWidth - 14, 40);
};
