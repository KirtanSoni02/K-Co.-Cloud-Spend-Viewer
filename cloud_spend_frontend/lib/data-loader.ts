import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import type { SpendRecord } from "./data";

// A loader to read all CSV files
export function loadSpendDataFromCSVs(): SpendRecord[] {
  const dataDir = path.join(process.cwd(), "data");

  const files = [
    { name: "aws_line_items_12mo.csv", provider: "AWS" },
    { name: "gcp_billing_12mo.csv", provider: "GCP" },
  ];

  let result: SpendRecord[] = [];

  files.forEach(file => {
    const filePath = path.join(dataDir, file.name);
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);

    // Read as CSV with XLSX
    const wb = XLSX.read(buf, { type: "buffer" });
    wb.SheetNames.forEach((sheetName, sheetIndex) => {
      const ws = wb.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(ws, { raw: false });

      jsonData.forEach((row: any, i: number) => {
        // Parse fields similar to your store.js
        const dateVal = row.date || row.Date || row.DATE || row.timestamp || "";
        const cloudProvider = row.cloud_provider || row.Cloud_Provider || file.provider;
        const service = row.service || row.Service || row.product || "";
        const team = row.team || row.Team || "Unknown";
        const env = row.env || row.Env || "prod";
        const costRaw = row.cost_usd || row.Cost_USD || row.cost || "0";

        const costClean = String(costRaw).replace(/[$,]/g, '');
        const cost_usd = parseFloat(costClean);

        // Date
        let parsedDate: Date | null = null;
        try {
          parsedDate = new Date(dateVal);
          if (isNaN(parsedDate.getTime())) {
            const excelDate = XLSX.SSF.parse_date_code(Number.parseFloat(dateVal));
            if (excelDate) parsedDate = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
            else parsedDate = null;
          }
        } catch { parsedDate = null; }
        if (!parsedDate || !cloudProvider || !service || isNaN(cost_usd)) return;

        const normCloud = String(cloudProvider).toUpperCase().includes("AWS")
          ? "AWS"
          : String(cloudProvider).toUpperCase().includes("GCP")
            ? "GCP"
            : null;
        if (!normCloud) return;

        let normEnv: "prod" | "staging" | "dev" =
          String(env).toLowerCase().includes("stag") ? "staging" :
          String(env).toLowerCase().includes("dev") ? "dev" : "prod";

        result.push({
          id: `csv-${file.provider}-${sheetIndex}-${i}`,
          date: parsedDate.toISOString().split("T")[0],
          cloud_provider: normCloud as "AWS" | "GCP",
          service,
          team,
          env: normEnv,
          cost_usd: Math.round(cost_usd * 100) / 100,
        });
      });
    });
  });

  // Most recent first (optional)
  result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return result;
}