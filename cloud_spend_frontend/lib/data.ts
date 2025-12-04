// This simulates the MongoDB data store
// In a real MERN app, this would be fetched from MongoDB via Mongoose

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

// Generate realistic spend data for the past 12 months
function generateSpendData(): SpendRecord[] {
  const data: SpendRecord[] = []
  const now = new Date()

  for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
    const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)

    // Generate AWS spend records
    for (let i = 0; i < 20; i++) {
      const day = Math.floor(Math.random() * 28) + 1
      const recordDate = new Date(date.getFullYear(), date.getMonth(), day)

      data.push({
        id: `aws-${monthOffset}-${i}`,
        date: recordDate.toISOString().split("T")[0],
        cloud_provider: "AWS",
        service: awsServices[Math.floor(Math.random() * awsServices.length)],
        team: teams[Math.floor(Math.random() * teams.length)],
        env: environments[Math.floor(Math.random() * environments.length)],
        cost_usd: Math.round((Math.random() * 5000 + 100) * 100) / 100,
      })
    }

    // Generate GCP spend records
    for (let i = 0; i < 15; i++) {
      const day = Math.floor(Math.random() * 28) + 1
      const recordDate = new Date(date.getFullYear(), date.getMonth(), day)

      data.push({
        id: `gcp-${monthOffset}-${i}`,
        date: recordDate.toISOString().split("T")[0],
        cloud_provider: "GCP",
        service: gcpServices[Math.floor(Math.random() * gcpServices.length)],
        team: teams[Math.floor(Math.random() * teams.length)],
        env: environments[Math.floor(Math.random() * environments.length)],
        cost_usd: Math.round((Math.random() * 4000 + 80) * 100) / 100,
      })
    }
  }

  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Singleton pattern for data store
let spendData: SpendRecord[] | null = null

let isUsingUploadedData = false

export function getSpendData(): SpendRecord[] {
  if (!spendData) {
    spendData = generateSpendData()
  }
  return spendData
}

export function setSpendData(data: SpendRecord[]): void {
  spendData = data
  isUsingUploadedData = true
}

export function resetSpendData(): void {
  spendData = generateSpendData()
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
