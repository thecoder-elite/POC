let completionChartInstance = null;

function renderCompletionChart(mockDB) {
  const ctx = document.getElementById("completionChart").getContext("2d");
  if (completionChartInstance) completionChartInstance.destroy();
  const scatterData = processData(mockDB);

  const TOTAL_STUDENTS = 50;
  const subtitleEl = document.getElementById("completion-subtitle");

  if (state.activityId) {
    // ==========================================
    // ACTIVITY LEVEL: Pie Chart
    // ==========================================
    if (subtitleEl)
      subtitleEl.innerText = "Students who finished this specific assignment";

    const completedCount = scatterData.filter(
      (s) => s.y !== null && !isNaN(s.y),
    ).length;
    const notCompletedCount = TOTAL_STUDENTS - completedCount;

    completionChartInstance = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Completed", "Missing"],
        datasets: [
          {
            data: [completedCount, notCompletedCount],
            backgroundColor: [
              "rgba(16, 185, 129, 0.8)",
              "rgba(241, 245, 249, 1)",
            ],
            borderColor: ["#10b981", "#cbd5e1"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { family: "'Nunito', sans-serif" } },
          },
        },
      },
    });
  } else {
    // ==========================================
    // CLASS LEVEL: Horizontal Stacked Bar Chart
    // ==========================================
    if (subtitleEl)
      subtitleEl.innerText =
        "Completion breakdown across all assigned activities";

    const activityStats = {};
    mockDB.forEach((log) => {
      if (!activityStats[log.activityId]) {
        activityStats[log.activityId] = {
          name: log.activityName,
          completed: 0,
        };
      }
      activityStats[log.activityId].completed++;
    });

    const labels = [];
    const completedData = [];
    const missingData = [];

    Object.values(activityStats).forEach((act) => {
      labels.push(act.name);
      completedData.push(act.completed);
      missingData.push(TOTAL_STUDENTS - act.completed);
    });

    completionChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Completed",
            data: completedData,
            backgroundColor: "rgba(16, 185, 129, 0.8)",
            borderRadius: 4,
          },
          {
            label: "Missing",
            data: missingData,
            backgroundColor: "rgba(241, 245, 249, 1)",
            borderColor: "#cbd5e1",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y", // <--- This flips the chart horizontally!
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            max: TOTAL_STUDENTS, // Move max to the X-axis
            title: { display: true, text: "Number of Students" },
            grid: { color: "#f1f5f9" },
          },
          y: {
            stacked: true,
            grid: { display: false }, // Hide grid lines behind the activity names
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { family: "'Nunito', sans-serif" } },
          },
        },
      },
    });
  }
}
