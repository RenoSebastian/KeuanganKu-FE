import { formatRupiah } from "@/lib/financial-math";
import { BudgetPDFData } from "./budget.types";

/**
 * ======================================================
 * HTML TEMPLATE — BUDGETING PDF
 * ======================================================
 * - Pure function
 * - Input: BudgetPDFData
 * - Output: string (HTML)
 * - Tidak bergantung browser / DOM
 */
export const renderBudgetHTML = (data: BudgetPDFData): string => {
    return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Simulasi Anggaran Ideal</title>
  <style>
    body {
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont;
      margin: 0;
      padding: 40px;
      color: #0f172a;
      background: #ffffff;
    }

    h1 {
      font-size: 28px;
      margin-bottom: 6px;
    }

    .subtitle {
      color: #475569;
      font-size: 13px;
      margin-bottom: 32px;
    }

    .card {
      border-radius: 16px;
      padding: 20px;
      background: #f8fafc;
      margin-bottom: 20px;
    }

    .row {
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }

    .metric h3 {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .metric p {
      font-size: 20px;
      font-weight: 800;
    }

    .hero {
      background: linear-gradient(135deg, #2563eb, #0ea5e9);
      color: white;
    }

    .hero h2 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.85;
    }

    .hero p {
      font-size: 32px;
      font-weight: 900;
      margin: 8px 0;
    }

    .hero span {
      font-size: 12px;
      opacity: 0.9;
    }

    .allocations {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .alloc {
      border-radius: 14px;
      padding: 16px;
      background: #ffffff;
      border-left: 6px solid;
    }

    .alloc h4 {
      font-size: 14px;
      margin: 0 0 6px;
    }

    .alloc strong {
      font-size: 16px;
    }

    .alloc small {
      color: #64748b;
      font-size: 11px;
    }

    footer {
      margin-top: 32px;
      font-size: 10px;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>

<body>

  <h1>Simulasi Anggaran Ideal Bulanan</h1>
  <div class="subtitle">
    ${data.monthYear} • ${data.name}
  </div>

  <!-- Income Context -->
  <div class="card row">
    <div class="metric">
      <h3>Penghasilan Tetap</h3>
      <p>${formatRupiah(data.fixedIncome)}</p>
    </div>
    <div class="metric">
      <h3>Penghasilan Tidak Tetap</h3>
      <p>${formatRupiah(data.variableIncome)}</p>
    </div>
  </div>

  <!-- Safe to Spend -->
  <div class="card hero">
    <h2>Batas Aman Biaya Hidup</h2>
    <p>${formatRupiah(data.safeToSpend)}</p>
    <span>
      Jika pengeluaran Anda melebihi angka ini, berarti Anda mengambil jatah tabungan masa depan Anda.
    </span>
  </div>

  <!-- Allocations -->
  <div class="allocations">
    ${data.allocations
            .map(
                a => `
      <div class="alloc" style="border-color:${a.color}">
        <h4>${a.label} (${a.percentage}%)</h4>
        <strong>${formatRupiah(a.amount)}</strong><br/>
        <small>${a.description}</small>
      </div>
    `
            )
            .join("")}
  </div>

  <footer>
    Laporan ini merupakan simulasi panduan pengelolaan gaji tetap, bukan evaluasi pengeluaran aktual.
  </footer>

</body>
</html>
`;
};
