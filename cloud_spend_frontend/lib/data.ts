// This simulates the MongoDB data store
// In a real MERN app, this would be fetched from MongoDB via Mongoose
import { loadSpendDataFromCSVs } from "./data-loader";

export interface SpendRecord {
  id: string
  date: string
  cloud_provider: "AWS" | "GCP"
  service: string
  team: string
  env: "prod" | "staging" | "dev"
  cost_usd: number
}

// AWS Services
const awsServices = ["EC2", "S3", "Lambda", "RDS", "CloudFront", "DynamoDB", "EKS", "SQS"]
// GCP Services
const gcpServices = [
  "Compute Engine",
  "BigQuery",
  "Cloud Storage",
  "Cloud Functions",
  "Cloud SQL",
  "GKE",
  "Pub/Sub",
  "Cloud Run",
]

const teams = ["Core", "Web", "Data", "Mobile", "DevOps"]
const environments: ("prod" | "staging" | "dev")[] = ["prod", "staging", "dev"]

// Singleton pattern for data store
let spendData: SpendRecord[] | null = null;

let isUsingUploadedData = false;

export function getSpendData(): SpendRecord[] {
  if (!spendData) {
    spendData = loadSpendDataFromCSVs();  
  }
  return spendData;
}

export function setSpendData(data: SpendRecord[]): void {
  spendData = data
  isUsingUploadedData = true
}

export function resetSpendData(): void {
  spendData = loadSpendDataFromCSVs()
  isUsingUploadedData = false
}

export function isUploadedData(): boolean {
  return isUsingUploadedData
}

export function getUniqueMonths(): string[] {
  const data = getSpendData()
  const months = new Set<string>()

  data.forEach((record) => {
    const date = new Date(record.date)
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    months.add(monthStr)
  })

  return Array.from(months).sort().reverse()
}

export function getUniqueTeams(): string[] {
  const data = getSpendData()
  const teams = new Set<string>()
  data.forEach((record) => teams.add(record.team))
  return Array.from(teams).sort()
}

export function getUniqueEnvironments(): string[] {
  const data = getSpendData()
  const envs = new Set<string>()
  data.forEach((record) => envs.add(record.env))
  return Array.from(envs).sort()
}
