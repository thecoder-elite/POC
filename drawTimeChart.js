let timeChartInstance = null;

function renderTimeVarianceChart() {
  const scatterData = processData(mockDB);
  const ctx = document.getElementById("timeVarianceChart").getContext("2d");
  const threshold = { percentile90Count: 0, percentile50Count: 0 };
  if (timeChartInstance) timeChartInstance.destroy();

  // Sort students from fastest (lowest time) to slowest (highest time)
  scatterData.forEach((pt) => {
    if (pt.percentile >= 90) threshold.percentile90Count++;
    else if (pt.percentile < 90 && pt.percentile <= 50)
      threshold.percentile50Count++;
  });
  const sortedData = [...scatterData].sort((a, b) => a.rawTime - b.rawTime);

  const labels = sortedData.map((d) => d.label);
  const times = sortedData.map((d) => d.rawTime);
  const percentiles = sortedData.map((d) => d.percentile);

  // Color code based on percentile
  const bgColors = sortedData.map((d) => {
    if (d.percentile >= 90) return "#10b981"; // Fast (Green)
    if (d.percentile >= 50) return "rgba(99, 102, 241, 0.7)"; // Average (Indigo)
    return "#f43f5e"; // Slow (Rose)
  });

  timeChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Time Spent (s)",
          data: times,
          backgroundColor: bgColors,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          title: { display: true, text: "Time Spent (Seconds)" },
          beginAtZero: true,
          grid: { color: "#f1f5f9" },
        },
        x: {
          title: { display: true, text: "Percentile Rank" },
          beginAtZero: true,
          grid: { color: "#f1f5f9" },
        },
      },
      plugins: {
        legend: {
          display: false, // Hides the legend boxes entirely
        },
        tooltip: {
          backgroundColor: "rgba(45, 45, 66, 0.9)",
          callbacks: {
            label: (ctx) => `Time: ${(ctx.raw / 60).toFixed(2)} mins`,
            afterLabel: (ctx) =>
              `Speed: ${percentiles[ctx.dataIndex]}th Percentile`,
          },
        },
        annotation: {
          annotations: {
            line1: {
              type: "line",
              xMin: threshold.percentile90Count - 1,
              xMax: threshold.percentile90Count - 1,
              borderColor: "rgba(251, 113, 133, 0.6)",
              borderWidth: 3,
              borderDash: [6, 6],
              label: {
                display: true, // Use 'enabled: true' if using plugin version 1.x
                content: "<90 Percentile",
                backgroundColor: "rgba(255, 99, 132, 0.8)",
                color: "white",
                font: {
                  size: 12,
                  weight: "bold",
                },
                position: "end", // 'start', 'center', or 'end'
              },
            }, // Soft Rose line
            line2: {
              type: "line",
              xMin: threshold.percentile50Count - 1,
              xMax: threshold.percentile50Count - 1,
              borderColor: "rgba(251, 113, 133, 0.6)",
              borderWidth: 3,
              borderDash: [6, 6],
              label: {
                display: true, // Use 'enabled: true' if using plugin version 1.x
                content: "<50 Percentile",
                backgroundColor: "rgba(255, 99, 132, 0.8)",
                color: "white",
                font: {
                  size: 12,
                  weight: "bold",
                },
                position: "end", // 'start', 'center', or 'end'
              },
            },
          },
        },
      },
    },
  });
}
