let quadrantChartInstance = null;
function renderQuadrantChart(mockDB) {
  const scatterData = processData(mockDB);
  const counts = { masters: 0, methodical: 0, rushers: 0, stuck: 0 };
  const threshold = state.masteryThreshold;
  Chart.defaults.font.family = "'Nunito', sans-serif";
  Chart.defaults.color = "#8c8ca1";
  const ctx = document.getElementById("quadrantChart").getContext("2d");
  if (quadrantChartInstance) quadrantChartInstance.destroy();

  scatterData.forEach((pt) => {
    if (pt.x > 0 && pt.y >= threshold) counts.masters++;
    else if (pt.x <= 0 && pt.y >= threshold) counts.methodical++;
    else if (pt.x > 0 && pt.y < threshold) counts.rushers++;
    else counts.stuck++;
  });

  // Helper function to determine color based on quadrant thresholds
  const getQuadrantColor = (ctx, opacity, isBorder = false) => {
    // If it's a legend item or something without data yet, return a default color
    if (ctx.dataIndex === undefined) return `rgba(99, 102, 241, ${opacity})`;

    const x = ctx.raw.x; // Fluency
    const y = ctx.raw.y; // Mastery

    if (x > 0 && y >= threshold) {
      // Top-Right: The Masters (Emerald Green)
      return isBorder ? "#10b981" : `rgba(16, 185, 129, ${opacity})`;
    } else if (x <= 0 && y >= threshold) {
      // Top-Left: The Methodical (Soft Indigo)
      return isBorder ? "#6366f1" : `rgba(99, 102, 241, ${opacity})`;
    } else if (x > 0 && y < threshold) {
      // Bottom-Right: The Rushers (Amber/Orange)
      return isBorder ? "#f59e0b" : `rgba(245, 158, 11, ${opacity})`;
    } else {
      // Bottom-Left: The Genuinely Stuck (Rose/Red)
      return isBorder ? "#f43f5e" : `rgba(244, 63, 94, ${opacity})`;
    }
  };

  quadrantChartInstance = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Students",
          data: scatterData,
          backgroundColor: (context) => getQuadrantColor(context, 0.8),
          borderColor: (context) => getQuadrantColor(context, 1, true),
          hoverBackgroundColor: (context) => getQuadrantColor(context, 1),
          borderWidth: 1,
          pointRadius: 8,
          pointHoverRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Fluency (Slower ← Average → Faster)",
            font: { size: 14, weight: "600" },
          },
          min: -3,
          max: 3,
          grid: { color: "#f1f5f9" },
        },
        y: {
          title: {
            display: true,
            text: "Mastery (Accuracy %)",
            font: { size: 14, weight: "600" },
          },
          min: 0,
          max: 100,
          grid: { color: "#f1f5f9" },
        },
      },
      plugins: {
        legend: {
          display: false, // Hides the legend boxes entirely
        },
        tooltip: {
          backgroundColor: "rgba(45, 45, 66, 0.9)",
          titleFont: { size: 14 },
          bodyFont: { size: 13 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) =>
              `${ctx.raw.label} =  Accuracy: ${ctx.raw.y}%, Time Spent: ${(ctx.raw.rawTime / 60).toFixed(2)}mins`,
          },
        },
        annotation: {
          annotations: {
            line1: {
              type: "line",
              yMin: threshold,
              yMax: threshold,
              borderColor: "rgba(251, 113, 133, 0.6)",
              borderWidth: 3,
              borderDash: [6, 6],
            }, // Soft Rose line
            line2: {
              type: "line",
              xMin: 0,
              xMax: 0,
              borderColor: "rgba(251, 113, 133, 0.6)",
              borderWidth: 3,
              borderDash: [6, 6],
            },
            labelMasters: {
              type: "label",
              xValue: 2.5,
              yValue: 95,
              content: `Masters: ${counts.masters}`,
              color: "#10b981",
              font: { size: 14, weight: "bold" },
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: 4,
              padding: 6,
            },
            labelMethodical: {
              type: "label",
              xValue: -2.5,
              yValue: 95,
              content: `Methodical: ${counts.methodical}`,
              color: "#6366f1",
              font: { size: 14, weight: "bold" },
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: 4,
              padding: 6,
            },
            labelRushers: {
              type: "label",
              xValue: 2.5,
              yValue: 5,
              content: `Rushers: ${counts.rushers}`,
              color: "#f59e0b",
              font: { size: 14, weight: "bold" },
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: 4,
              padding: 6,
            },
            labelStuck: {
              type: "label",
              xValue: -2.5,
              yValue: 5,
              content: `Stuck: ${counts.stuck}`,
              color: "#f43f5e",
              font: { size: 14, weight: "bold" },
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: 4,
              padding: 6,
            },
          },
        },
      },
    },
  });
}

function calculateZScores(dataArray) {
  if (dataArray.length === 0) return [];
  const totalTime = dataArray.reduce((sum, item) => sum + item.timeSpent, 0);
  const meanTime = totalTime / dataArray.length;
  const variance =
    dataArray.reduce(
      (sum, item) => sum + Math.pow(item.timeSpent - meanTime, 2),
      0,
    ) / dataArray.length;
  const stdDev = Math.sqrt(variance) || 1;

  const totalStudents = dataArray.length;

  return dataArray.map((item) => {
    // Count how many students took MORE time (were slower)
    const studentsSlower = dataArray.filter(
      (d) => d.timeSpent > item.timeSpent,
    ).length;
    // Calculate the percentile (e.g., faster than 85% of the class)
    const percentile = Math.round((studentsSlower / totalStudents) * 100);

    return {
      x: ((item.timeSpent - meanTime) / stdDev) * -1,
      y: item.score,
      label: item.learnerId,
      rawTime: item.timeSpent,
      percentile: percentile,
    };
  });
}

function processData(mockDB) {
  let rawMetrics = [];

  if (state.questionId) {
    // QUESTION LEVEL
    const testLogs = mockDB.filter(
      (log) => log.activityId === state.activityId,
    );
    testLogs.forEach((log) => {
      const qItem = log.activityDetails.testSessionDetails.items.find(
        (i) => i.itemId === state.questionId,
      );
      if (qItem)
        rawMetrics.push({
          learnerId: log.learnerId,
          score: qItem.score,
          timeSpent: qItem.timeSpent,
        });
    });
  } else if (state.activityId) {
    // ACTIVITY LEVEL
    const actLogs = mockDB.filter((log) => log.activityId === state.activityId);
    actLogs.forEach((log) => {
      if (log.itemType === "TEACHER_TEST_ACTIVITY") {
        // FIX: Dynamically sum the timeSpent from all questions
        const actualTotalTime =
          log.activityDetails.testSessionDetails.items.reduce(
            (sum, item) => sum + item.timeSpent,
            0,
          );
        rawMetrics.push({
          learnerId: log.learnerId,
          score: log.activityDetails.testSessionDetails.score,
          timeSpent: actualTotalTime,
        });
      } else {
        const session = log.activityDetails.learningSessionDetails;
        rawMetrics.push({
          learnerId: log.learnerId,
          score: session.score,
          timeSpent: session.timeSpent,
        });
      }
    });
  } else {
    // CLASS LEVEL (Aggregate all activities)
    const classLogs = mockDB.filter((log) => log.classId === state.classId);
    let studentAggregates = {};

    classLogs.forEach((log) => {
      if (!studentAggregates[log.learnerId]) {
        studentAggregates[log.learnerId] = {
          totalScore: 0,
          totalTime: 0,
          count: 0,
        };
      }
      if (log.itemType === "TEACHER_TEST_ACTIVITY") {
        // FIX: Dynamically sum the timeSpent from all questions for class aggregation
        const actualTotalTime =
          log.activityDetails.testSessionDetails.items.reduce(
            (sum, item) => sum + item.timeSpent,
            0,
          );
        studentAggregates[log.learnerId].totalScore +=
          log.activityDetails.testSessionDetails.score;
        studentAggregates[log.learnerId].totalTime += actualTotalTime;
      } else {
        studentAggregates[log.learnerId].totalScore +=
          log.activityDetails.learningSessionDetails.score;
        studentAggregates[log.learnerId].totalTime +=
          log.activityDetails.learningSessionDetails.timeSpent;
      }
      studentAggregates[log.learnerId].count++;
    });

    for (const [learnerId, data] of Object.entries(studentAggregates)) {
      rawMetrics.push({
        learnerId: learnerId,
        score: data.totalScore / data.count,
        timeSpent: data.totalTime / data.count,
      });
    }
  }

  return calculateZScores(rawMetrics);
}
