interface ExportData {
  entries: Array<{
    id: string
    date: string
    startTime: string
    endTime: string
    activity: string
    category: string
    duration: number
  }>
  analytics: {
    totalHours: number
    avgDailyHours: number
    productivityScore: number
    growth: { hours: number; count: number }
    maintenance: { hours: number; count: number }
    shrink: { hours: number; count: number }
  }
  dateRange: { start: Date; end: Date }
}

export async function exportToPDF(data: ExportData) {
  // Create a simple HTML structure for PDF generation
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Time Tracking Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f8f9fa; font-weight: bold; }
        .category-growth { color: #16a34a; font-weight: bold; }
        .category-maintenance { color: #2563eb; font-weight: bold; }
        .category-shrink { color: #dc2626; font-weight: bold; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1f2937; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Time Tracking Report</h1>
        <p>${data.dateRange.start.toLocaleDateString()} - ${data.dateRange.end.toLocaleDateString()}</p>
      </div>

      <div class="section">
        <div class="section-title">Summary Statistics</div>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">${data.analytics.totalHours}h</div>
            <div class="stat-label">Total Hours Tracked</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.analytics.avgDailyHours}h</div>
            <div class="stat-label">Average Daily Hours</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.analytics.productivityScore}%</div>
            <div class="stat-label">Productivity Score</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.entries.length}</div>
            <div class="stat-label">Total Activities</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Category Breakdown</div>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value category-growth">${data.analytics.growth.hours}h</div>
            <div class="stat-label">Growth Activities (${data.analytics.growth.count})</div>
          </div>
          <div class="stat-card">
            <div class="stat-value category-maintenance">${data.analytics.maintenance.hours}h</div>
            <div class="stat-label">Maintenance Activities (${data.analytics.maintenance.count})</div>
          </div>
          <div class="stat-card">
            <div class="stat-value category-shrink">${data.analytics.shrink.hours}h</div>
            <div class="stat-label">Shrink Activities (${data.analytics.shrink.count})</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Detailed Activity Log</div>
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Activity</th>
              <th>Category</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${data.entries
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime() || a.startTime.localeCompare(b.startTime),
              )
              .map(
                (entry) => `
              <tr>
                <td>${new Date(entry.date).toLocaleDateString()}</td>
                <td>${entry.startTime} - ${entry.endTime}</td>
                <td>${entry.activity}</td>
                <td class="category-${entry.category}">${entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}</td>
                <td>${Math.round((entry.duration / 60) * 10) / 10}h</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `

  // Create a blob and download
  const blob = new Blob([htmlContent], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `time-tracking-report-${data.dateRange.start.toISOString().split("T")[0]}-to-${data.dateRange.end.toISOString().split("T")[0]}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  // Note: For actual PDF generation, you would typically use a library like jsPDF or Puppeteer
  // This implementation creates an HTML file that can be printed to PDF by the user
}
