// const fs = require('fs');
// const path = require('path');
// const XLSX = require('xlsx');

// // In-memory data store
// let spendData = [];

// // Helper to normalize Environment names
// function normalizeEnv(env) {
//   if (!env) return "prod";
//   const lower = String(env).toLowerCase();
//   if (lower.includes("prod")) return "prod";
//   if (lower.includes("stag")) return "staging";
//   if (lower.includes("dev")) return "dev";
//   return "prod"; // Default
// }

// // --- ROBUST DATE PARSER ---
// function parseFlexibleDate(dateVal) {
//   if (!dateVal) return null;

//   if (typeof dateVal === 'number') {
//     const excelDate = XLSX.SSF.parse_date_code(dateVal);
//     if (excelDate) return new Date(excelDate.y, excelDate.m - 1, excelDate.d);
//   }

//   const strVal = String(dateVal).trim();
//   let parsed = new Date(strVal);

//   if (isNaN(parsed.getTime())) {
//     const parts = strVal.split(/[-/]/);
//     if (parts.length === 3) {
//       if (parts[2].length === 4) {
//         const day = parts[0];
//         const month = parts[1];
//         const year = parts[2];
//         parsed = new Date(`${year}-${month}-${day}`);
//       }
//     }
//   }

//   if (isNaN(parsed.getTime())) return null;
//   return parsed;
// }

// /**
//  * Parses Excel or CSV buffer into SpendRecord objects
//  */
// function parseExcelData(buffer, fileName, defaultProvider = null) {
//   const workbook = XLSX.read(buffer, { type: "buffer" });
//   const records = [];

//   workbook.SheetNames.forEach((sheetName, sheetIndex) => {
//     const worksheet = workbook.Sheets[sheetName];
//     const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

//     const nameToCheck = (fileName + sheetName).toLowerCase();
//     let detectedProvider = defaultProvider;
    
//     if (!detectedProvider) {
//         if (nameToCheck.includes("aws")) detectedProvider = "AWS";
//         else if (nameToCheck.includes("gcp") || nameToCheck.includes("google")) detectedProvider = "GCP";
//     }

//     jsonData.forEach((row, index) => {
//       const dateVal = row.date || row.Date || row.DATE || row.timestamp || "";
//       const cloudProvider = row.cloud_provider || row.Cloud_Provider || detectedProvider;
//       const service = row.service || row.Service || row.product || "";
//       const team = row.team || row.Team || "Unknown";
//       const env = row.env || row.Env || "prod";
//       const costRaw = row.cost_usd || row.Cost_USD || row.cost || "0";
      
//       // Capture Specific IDs if available
//       const accountId = row.account_id || row.Account_ID || row.accountId || "imported_account";
//       const projectId = row.project_id || row.Project_ID || row.projectId || "imported_project";

//       const costClean = String(costRaw).replace(/[$,]/g, ''); 
//       const costUsd = parseFloat(costClean);
//       const parsedDate = parseFlexibleDate(dateVal);

//       if (!parsedDate || !cloudProvider || !service || isNaN(costUsd)) return;

//       const normalizedCloud = cloudProvider.toUpperCase().includes("AWS") ? "AWS" 
//         : (cloudProvider.toUpperCase().includes("GCP") ? "GCP" : null);

//       if (!normalizedCloud) return;

//       records.push({
//         id: `rec-${sheetIndex}-${index}-${Date.now()}`,
//         date: parsedDate.toISOString().split("T")[0],
//         cloud_provider: normalizedCloud,
//         service: service,
//         team: team,
//         env: normalizeEnv(env),
//         cost_usd: Math.round(costUsd * 100) / 100,
//         // Store IDs temporarily for saving later
//         account_id: accountId,
//         project_id: projectId
//       });
//     });
//   });

//   return records;
// }

// // --- INTELLIGENT SAVE FUNCTION ---
// function saveNewRecordsToDisk(newRecords) {
//   const dataDir = path.join(__dirname, 'data');
//   const awsFile = path.join(dataDir, 'aws_line_items_12mo.csv');
//   const gcpFile = path.join(dataDir, 'gcp_billing_12mo.csv');

//   let awsCount = 0;
//   let gcpCount = 0;

//   newRecords.forEach(record => {
//     // AWS File Format: date, account_id, service, team, env, cost_usd
//     // GCP File Format: date, project_id, service, team, env, cost_usd
    
//     let line = "";

//     try {
//       if (record.cloud_provider === 'AWS') {
//         // Use account_id for AWS
//         line = `\n${record.date},${record.account_id},${record.service},${record.team},${record.env},${record.cost_usd}`;
//         fs.appendFileSync(awsFile, line);
//         awsCount++;
//       } else if (record.cloud_provider === 'GCP') {
//         // Use project_id for GCP
//         line = `\n${record.date},${record.project_id},${record.service},${record.team},${record.env},${record.cost_usd}`;
//         fs.appendFileSync(gcpFile, line);
//         gcpCount++;
//       }
//     } catch (err) {
//       console.error("Error appending to file:", err);
//     }
//   });

//   console.log(`Saved to disk: ${awsCount} AWS records, ${gcpCount} GCP records appended.`);
// }

// // --- Exported Functions ---

// function getSpendData() {
//   return spendData;
// }

// function setSpendData(data) {
//   spendData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
// }

// function addSpendData(newData) {
//   // 1. Save to disk so it persists permanently
//   saveNewRecordsToDisk(newData);
  
//   // 2. Reload everything from disk to get a fresh, unified state (Old + New)
//   loadInitialData();
// }

// function resetSpendData() {
//   spendData = [];
//   loadInitialData(); 
// }

// function loadInitialData() {
//   console.log("Loading data from ./data folder...");
//   const dataDir = path.join(__dirname, 'data');
  
//   const files = [
//     { name: 'aws_line_items_12mo.csv', provider: 'AWS' },
//     { name: 'gcp_billing_12mo.csv', provider: 'GCP' }
//   ];

//   let initialRecords = [];

//   files.forEach(file => {
//     const filePath = path.join(dataDir, file.name);
//     if (fs.existsSync(filePath)) {
//       try {
//         const fileBuffer = fs.readFileSync(filePath);
//         // Parse the file (which now includes appended rows)
//         const records = parseExcelData(fileBuffer, file.name, file.provider);
//         initialRecords = [...initialRecords, ...records];
//       } catch (err) {
//         console.error(`Error loading ${file.name}:`, err);
//       }
//     }
//   });

//   setSpendData(initialRecords);
//   console.log(`Total records loaded: ${spendData.length}`);
// }

// module.exports = {
//   getSpendData,
//   setSpendData,
//   addSpendData,
//   resetSpendData,
//   loadInitialData,
//   parseExcelData
// };









const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// In-memory data store
let spendData = [];

// Helper to normalize Environment names
function normalizeEnv(env) {
  if (!env) return "prod";
  const lower = String(env).toLowerCase();
  if (lower.includes("prod")) return "prod";
  if (lower.includes("stag")) return "staging";
  if (lower.includes("dev")) return "dev";
  return "prod"; // Default
}

// --- ROBUST DATE PARSER ---
function parseFlexibleDate(dateVal) {
  if (!dateVal) return null;

  // 1. If it's a number (Excel Serial Date), convert it
  if (typeof dateVal === 'number') {
    const excelDate = XLSX.SSF.parse_date_code(dateVal);
    if (excelDate) {
      return new Date(excelDate.y, excelDate.m - 1, excelDate.d);
    }
  }

  // 2. Try standard string parsing
  const strVal = String(dateVal).trim();
  let parsed = new Date(strVal);

  // 3. If standard parsing fails (Invalid Date), try manual formats
  if (isNaN(parsed.getTime())) {
    // Handle DD-MM-YYYY or DD/MM/YYYY
    const parts = strVal.split(/[-/]/);
    if (parts.length === 3) {
      // Check if the last part is the year (4 digits)
      if (parts[2].length === 4) {
        // Assume DD-MM-YYYY -> Convert to YYYY-MM-DD
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        parsed = new Date(`${year}-${month}-${day}`);
      }
    }
  }

  // Final check
  if (isNaN(parsed.getTime())) return null;
  return parsed;
}

/**
 * Parses Excel or CSV buffer into SpendRecord objects
 */
function parseExcelData(buffer, fileName, defaultProvider = null) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const records = [];

  workbook.SheetNames.forEach((sheetName, sheetIndex) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    // Detect provider from filename if not explicitly provided
    const nameToCheck = (fileName + sheetName).toLowerCase();
    let detectedProvider = defaultProvider;
    
    if (!detectedProvider) {
        if (nameToCheck.includes("aws")) detectedProvider = "AWS";
        else if (nameToCheck.includes("gcp") || nameToCheck.includes("google")) detectedProvider = "GCP";
    }

    jsonData.forEach((row, index) => {
      // 1. Extract raw values
      const dateVal = row.date || row.Date || row.DATE || row.timestamp || "";
      const cloudProvider = row.cloud_provider || row.Cloud_Provider || detectedProvider;
      const service = row.service || row.Service || row.product || "";
      const team = row.team || row.Team || "Unknown";
      const env = row.env || row.Env || "prod";
      const costRaw = row.cost_usd || row.Cost_USD || row.cost || "0";
      
      const accountId = row.account_id || row.Account_ID || row.accountId || "imported_account";
      const projectId = row.project_id || row.Project_ID || row.projectId || "imported_project";

      // 2. Parse Cost (Remove $ or ,)
      const costClean = String(costRaw).replace(/[$,]/g, ''); 
      const costUsd = parseFloat(costClean);

      // 3. Parse Date (Robust Method)
      const parsedDate = parseFlexibleDate(dateVal);

      // 4. Validation
      if (!parsedDate || !cloudProvider || !service || isNaN(costUsd)) {
        return; // Skip invalid rows
      }

      const normalizedCloud = cloudProvider.toUpperCase().includes("AWS") ? "AWS" 
        : (cloudProvider.toUpperCase().includes("GCP") ? "GCP" : null);

      if (!normalizedCloud) return;

      // 5. Create Record
      records.push({
        id: `rec-${sheetIndex}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: parsedDate.toISOString().split("T")[0],
        cloud_provider: normalizedCloud,
        service: service,
        team: team,
        env: normalizeEnv(env),
        cost_usd: Math.round(costUsd * 100) / 100,
        account_id: accountId,
        project_id: projectId
      });
    });
  });

  return records;
}

// --- Exported Functions ---

function getSpendData() {
  return spendData;
}

function setSpendData(data) {
  spendData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function loadInitialData() {
  console.log("Loading data from ./data folder...");
  const dataDir = path.join(__dirname, 'data');
  
  const files = [
    { name: 'aws_line_items_12mo.csv', provider: 'AWS' },
    { name: 'gcp_billing_12mo.csv', provider: 'GCP' }
  ];

  let initialRecords = [];

  files.forEach(file => {
    const filePath = path.join(dataDir, file.name);
    if (fs.existsSync(filePath)) {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        // Parse the file
        const records = parseExcelData(fileBuffer, file.name, file.provider);
        console.log(`Loaded ${records.length} records from ${file.name}`);
        initialRecords = [...initialRecords, ...records];
      } catch (err) {
        console.error(`Error loading ${file.name}:`, err);
      }
    } else {
        console.warn(`Warning: File ${file.name} not found in ${dataDir}`);
    } 
  });

  setSpendData(initialRecords);
  console.log(`Total records loaded: ${spendData.length}`);
}

module.exports = {
  getSpendData,
  loadInitialData
};