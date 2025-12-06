// import { type NextRequest, NextResponse } from "next/server"
// import { setSpendData, resetSpendData, isUploadedData, type SpendRecord } from "@/lib/data"
// import * as XLSX from "xlsx"

// // Parse and validate uploaded Excel data
// function parseExcelData(buffer: ArrayBuffer): SpendRecord[] {
//   const workbook = XLSX.read(buffer, { type: "array" })
//   const records: SpendRecord[] = []

//   // Process all sheets in the workbook
//   workbook.SheetNames.forEach((sheetName, sheetIndex) => {
//     const worksheet = workbook.Sheets[sheetName]
//     const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false })

//     // Try to detect cloud provider from sheet name
//     const sheetNameLower = sheetName.toLowerCase()
//     const isAwsSheet = sheetNameLower.includes("aws")
//     const isGcpSheet = sheetNameLower.includes("gcp")

//     jsonData.forEach((row: any, index: number) => {
//       // Map common column variations
//       const date = row.date || row.Date || row.DATE || row.timestamp || row.Timestamp || ""
//       const cloudProvider =
//         row.cloud_provider ||
//         row.Cloud_Provider ||
//         row.cloud ||
//         row.Cloud ||
//         row.provider ||
//         row.Provider ||
//         (isAwsSheet ? "AWS" : isGcpSheet ? "GCP" : "")
//       const service = row.service || row.Service || row.SERVICE || row.product || row.Product || ""
//       const team = row.team || row.Team || row.TEAM || row.department || row.Department || "Unknown"
//       const env = row.env || row.Env || row.ENV || row.environment || row.Environment || "prod"
//       const costUsd = Number.parseFloat(
//         row.cost_usd || row.Cost_USD || row.cost || row.Cost || row.amount || row.Amount || "0",
//       )

//       // Validate required fields
//       if (!date || !cloudProvider || !service || isNaN(costUsd)) {
//         return // Skip invalid rows
//       }

//       // Normalize cloud provider
//       const normalizedCloud = cloudProvider.toUpperCase().includes("AWS")
//         ? "AWS"
//         : cloudProvider.toUpperCase().includes("GCP") || cloudProvider.toUpperCase().includes("GOOGLE")
//           ? "GCP"
//           : cloudProvider.toUpperCase()

//       if (normalizedCloud !== "AWS" && normalizedCloud !== "GCP") {
//         return // Skip non-AWS/GCP records
//       }

//       // Normalize environment
//       const normalizedEnv = env.toLowerCase().includes("prod")
//         ? "prod"
//         : env.toLowerCase().includes("stag")
//           ? "staging"
//           : env.toLowerCase().includes("dev")
//             ? "dev"
//             : "prod"

//       // Parse date - handle various formats
//       let parsedDate: Date
//       try {
//         parsedDate = new Date(date)
//         if (isNaN(parsedDate.getTime())) {
//           // Try parsing Excel serial number
//           const excelDate = XLSX.SSF.parse_date_code(Number.parseFloat(date))
//           if (excelDate) {
//             parsedDate = new Date(excelDate.y, excelDate.m - 1, excelDate.d)
//           } else {
//             return // Skip invalid date
//           }
//         }
//       } catch {
//         return // Skip invalid date
//       }

//       records.push({
//         id: `uploaded-${sheetIndex}-${index}`,
//         date: parsedDate.toISOString().split("T")[0],
//         cloud_provider: normalizedCloud as "AWS" | "GCP",
//         service,
//         team,
//         env: normalizedEnv as "prod" | "staging" | "dev",
//         cost_usd: Math.round(costUsd * 100) / 100,
//       })
//     })
//   })

//   // Sort by date descending
//   return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
// }

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData()
//     const file = formData.get("file") as File | null

//     if (!file) {
//       return NextResponse.json({ error: "No file provided" }, { status: 400 })
//     }

//     // Validate file type
//     const validTypes = [
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
//       "application/vnd.ms-excel", // .xls
//       "text/csv", // .csv
//     ]

//     const fileExtension = file.name.split(".").pop()?.toLowerCase()
//     if (!validTypes.includes(file.type) && !["xlsx", "xls", "csv"].includes(fileExtension || "")) {
//       return NextResponse.json(
//         { error: "Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file." },
//         { status: 400 },
//       )
//     }

//     const buffer = await file.arrayBuffer()
//     const records = parseExcelData(buffer)

//     if (records.length === 0) {
//       return NextResponse.json(
//         {
//           error:
//             "No valid records found. Please ensure your file has columns: date, cloud_provider (AWS/GCP), service, team, env, cost_usd",
//         },
//         { status: 400 },
//       )
//     }

//     // Update the data store
//     setSpendData(records)

//     return NextResponse.json({
//       success: true,
//       message: `Successfully imported ${records.length} records`,
//       recordCount: records.length,
//       awsCount: records.filter((r) => r.cloud_provider === "AWS").length,
//       gcpCount: records.filter((r) => r.cloud_provider === "GCP").length,
//     })
//   } catch (error) {
//     console.error("Upload error:", error)
//     return NextResponse.json({ error: "Failed to process file. Please check the file format." }, { status: 500 })
//   }
// }

// // DELETE endpoint to reset data
// export async function DELETE() {
//   resetSpendData()
//   return NextResponse.json({ success: true, message: "Data reset to default" })
// }

// // GET endpoint to check upload status
// export async function GET() {
//   return NextResponse.json({ isUploaded: isUploadedData() })
// }


import { type NextRequest, NextResponse } from "next/server";
import { setSpendData, resetSpendData, isUploadedData, type SpendRecord } from "@/lib/data";
import * as XLSX from "xlsx";

// Parse and robustly validate uploaded Excel/CSV
function parseExcelData(buffer: ArrayBuffer, filename: string): SpendRecord[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const records: SpendRecord[] = [];

  workbook.SheetNames.forEach((sheetName, sheetIndex) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    // Detect provider from sheet or filename
    const lower = (sheetName + filename).toLowerCase();
    let detectedProvider = "";
    if (lower.includes("aws")) detectedProvider = "AWS";
    else if (lower.includes("gcp") || lower.includes("google")) detectedProvider = "GCP";

    jsonData.forEach((row: any, index: number) => {
      // Extract
      const date = row.date || row.Date || row.DATE || row.timestamp || "";
      const cloudProvider =
        row.cloud_provider ||
        row.Cloud_Provider ||
        detectedProvider;
      const service = row.service || row.Service || row.product || "";
      const team = row.team || row.Team || "Unknown";
      const env = row.env || row.Env || "prod";
      const costRaw = row.cost_usd || row.Cost_USD || row.cost || "0";

      // Parse cost (strip $ ,)
      const costClean = String(costRaw).replace(/[$,]/g, '');
      const costUsd = parseFloat(costClean);

      // Validate fields
      if (!date || !cloudProvider || !service || isNaN(costUsd)) return;

      const normCloud = cloudProvider.toUpperCase().includes("AWS")
        ? "AWS"
        : cloudProvider.toUpperCase().includes("GCP") || cloudProvider.toUpperCase().includes("GOOGLE")
          ? "GCP"
          : null;
      if (!normCloud) return;

      // Normalize env
      const normEnv = env.toLowerCase().includes("prod")
        ? "prod"
        : env.toLowerCase().includes("stag")
          ? "staging"
          : env.toLowerCase().includes("dev")
            ? "dev"
            : "prod";

      // Parse date, robust
      let parsedDate: Date | null = null;
      try {
        parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          const excelDate = XLSX.SSF.parse_date_code(Number.parseFloat(date));
          if (excelDate) {
            parsedDate = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
          }
        }
      } catch {}
      if (!parsedDate || isNaN(parsedDate.getTime())) return;

      records.push({
        id: `imported-${sheetIndex}-${index}`,
        date: parsedDate.toISOString().split("T")[0],
        cloud_provider: normCloud as "AWS" | "GCP",
        service,
        team,
        env: normEnv as "prod" | "staging" | "dev",
        cost_usd: Math.round(costUsd * 100) / 100,
      });
    });
  });

  // Sort descending by date
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Accept valid types/extensions
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!validTypes.includes(file.type) && !["xlsx", "xls", "csv"].includes(fileExtension || "")) {
      return NextResponse.json({
        error: "Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file."
      }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const records = parseExcelData(buffer, file.name);

    if (records.length === 0) {
      return NextResponse.json({
        error: "No valid records found. Please ensure your file has columns: date, cloud_provider (AWS/GCP), service, team, env, cost_usd"
      }, { status: 400 });
    }

    setSpendData(records);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${records.length} records`,
      recordCount: records.length,
      awsCount: records.filter(r => r.cloud_provider === "AWS").length,
      gcpCount: records.filter(r => r.cloud_provider === "GCP").length
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process file. Please check the file format." }, { status: 500 });
  }
}

// DELETE: reset imported data
export async function DELETE() {
  resetSpendData();
  return NextResponse.json({ success: true, message: "Data reset to default" });
}

// GET: upload status
export async function GET() {
  return NextResponse.json({ isUploaded: isUploadedData() });
}