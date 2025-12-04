const express = require('express');
const cors = require('cors');
const { getSpendData, loadInitialData } = require('./store');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
 
// Helper for Summary 
function calculateSummary(records) {
  let total = 0;
  let aws = 0;
  let gcp = 0;
  const serviceCosts = {};

  records.forEach(r => {
    total += r.cost_usd;
    if (r.cloud_provider === 'AWS') aws += r.cost_usd;
    if (r.cloud_provider === 'GCP') gcp += r.cost_usd;

    const s = r.service;
    serviceCosts[s] = (serviceCosts[s] || 0) + r.cost_usd;
  });

  let topService = { service: 'None', total: 0 };
  for (const [service, cost] of Object.entries(serviceCosts)) {
    if (cost > topService.total) {
      topService = { service, total: cost };
    }
  }

  return {
    total: Math.round(total * 100) / 100,
    aws: Math.round(aws * 100) / 100,
    gcp: Math.round(gcp * 100) / 100,
    recordCount: records.length,
    topService: topService.total > 0 ? topService : undefined
  };
}

// Routes 

app.get('/api/spend', (req, res) => {
  const allRecords = getSpendData();
  
  const { cloud, team, month, env } = req.query;
  let filtered = allRecords;

  if (cloud && cloud !== 'all') filtered = filtered.filter(r => r.cloud_provider.toUpperCase() === cloud.toUpperCase());
  if (team && team !== 'all') filtered = filtered.filter(r => r.team === team);
  if (env && env !== 'all') filtered = filtered.filter(r => r.env === env);
  if (month && month !== 'all') filtered = filtered.filter(r => r.date.startsWith(month));

  const months = new Set();
  const teams = new Set();
  const envs = new Set();
  
  allRecords.forEach(r => {
    months.add(r.date.substring(0, 7));
    teams.add(r.team);
    envs.add(r.env);
  });

  const monthlyDataMap = {};
  const teamDataMap = {};
  const dailyDataMap = {};

  filtered.forEach(r => {
    const m = r.date.substring(0, 7);
    if (!monthlyDataMap[m]) monthlyDataMap[m] = { month: m, aws: 0, gcp: 0, total: 0 };
    monthlyDataMap[m].total += r.cost_usd;
    if (r.cloud_provider === 'AWS') monthlyDataMap[m].aws += r.cost_usd;
    if (r.cloud_provider === 'GCP') monthlyDataMap[m].gcp += r.cost_usd;

    if (!teamDataMap[r.team]) teamDataMap[r.team] = 0;
    teamDataMap[r.team] += r.cost_usd;

    const d = r.date;
    if (!dailyDataMap[d]) dailyDataMap[d] = { date: d, day: new Date(d).getDate(), aws: 0, gcp: 0, total: 0 };
    dailyDataMap[d].total += r.cost_usd;
    if (r.cloud_provider === 'AWS') dailyDataMap[d].aws += r.cost_usd;
    if (r.cloud_provider === 'GCP') dailyDataMap[d].gcp += r.cost_usd;
  });

  res.json({
    records: filtered,
    summary: calculateSummary(filtered),
    monthlyData: Object.values(monthlyDataMap).sort((a, b) => a.month.localeCompare(b.month)),
    dailyData: Object.values(dailyDataMap).sort((a, b) => a.date.localeCompare(b.date)),
    teamData: Object.entries(teamDataMap).map(([team, total]) => ({ team, total })).sort((a, b) => b.total - a.total),
    filters: {
        months: Array.from(months).sort().reverse(),
        teams: Array.from(teams).sort(),
        environments: Array.from(envs).sort()
    },
    selectedMonth: month || 'all'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  loadInitialData();
});