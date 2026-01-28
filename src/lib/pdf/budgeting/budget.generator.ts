import puppeteer from "puppeteer";
import { renderBudgetHTML } from "./budget-html.template";
import { BudgetResult } from "@/lib/types";

/**
 * ======================================================
 * PDF GENERATOR — BUDGETING (HTML → PDF)
 * ======================================================
 * - Server-side only
 * - Tidak menyentuh DOM / Browser API
 * - Return: Buffer (PDF)
 */
export const generateBudgetPDF = async (
    monthly: BudgetResult,
    profile: {
        name: string;
        fixedIncome: number;
        variableIncome?: number;
    }
): Promise<Buffer> => {
    // 1️⃣ Siapkan HTML
    const html = renderBudgetHTML({
        name: profile.name,
        monthYear: new Date().toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
        }),
        fixedIncome: profile.fixedIncome,
        variableIncome: profile.variableIncome ?? 0,
        safeToSpend: monthly.safeToSpend,
        allocations: monthly.allocations.map((a) => ({
            label: a.label,
            percentage: a.percentage,
            amount: a.amount,
            description: a.description,
            color: getColorByType(a.type),
        })),
    });

    // 2️⃣ Launch Puppeteer (SERVER)
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        const page = await browser.newPage();

        // 3️⃣ Inject HTML
        await page.setContent(html, {
            waitUntil: "networkidle0",
        });

        // 4️⃣ Generate PDF
        const pdfUint8 = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "24px",
                bottom: "24px",
                left: "24px",
                right: "24px",
            },
        });

        // 5️⃣ Convert ke Buffer (Node-safe)
        return Buffer.from(pdfUint8);
    } finally {
        await browser.close();
    }
};

/**
 * ======================================================
 * HELPER — Warna berdasarkan tipe alokasi
 * ======================================================
 */
const getColorByType = (type: string): string => {
    switch (type) {
        case "NEEDS":
            return "#2563eb"; // blue
        case "DEBT_PROD":
            return "#f59e0b"; // amber
        case "DEBT_CONS":
            return "#ef4444"; // red
        case "INSURANCE":
            return "#6366f1"; // indigo
        case "SAVING":
            return "#10b981"; // emerald
        default:
            return "#64748b"; // slate
    }
};
