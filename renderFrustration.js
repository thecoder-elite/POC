function renderFrustrationAlerts(mockDB) {
  const scatterData = processData(mockDB);
  const listContainer = document.getElementById("frustration-list");
  listContainer.innerHTML = "";

  const totalStudents = scatterData.length;
  if (totalStudents === 0) return;

  // 1. Calculate Frustration Index for each student
  const analyzedStudents = scatterData.map((student) => {
    // How many students was this person slower than?
    const slowerThanCount = scatterData.filter(
      (s) => s.rawTime < student.rawTime,
    ).length;
    const timePercentile = (slowerThanCount / totalStudents) * 100;

    // How many students did this person score better than?
    const scoredBetterThanCount = scatterData.filter(
      (s) => s.y < student.y,
    ).length;
    const scorePercentile = (scoredBetterThanCount / totalStudents) * 100;

    const frustrationScore = Math.round(timePercentile - scorePercentile);

    return {
      name: student.label,
      timeMinutes: (student.rawTime / 60).toFixed(1), // Converted from seconds to minutes
      score: student.y,
      frustrationScore: frustrationScore,
    };
  });

  // 2. Filter for frustrated students and sort by severity
  const frustratedStudents = analyzedStudents
    .filter((s) => s.frustrationScore > 50) // Threshold: Score > 30 triggers an alert
    .sort((a, b) => b.frustrationScore - a.frustrationScore);

  // 3. Render the UI Cards
  if (frustratedStudents.length === 0) {
    listContainer.innerHTML = `<div style="padding: 15px; background: #f0fdf4; color: #166534; border-radius: 8px; border: 1px solid #bbf7d0;">All clear! No students are showing high frustration patterns right now.</div>`;
    return;
  }

  frustratedStudents.forEach((student) => {
    const card = document.createElement("div");
    card.style.cssText =
      "padding: 15px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;";

    card.innerHTML = `
            <div>
                <strong style="color: #be123c; font-size: 16px;">${student.name}</strong>
                <div style="color: #fb7185; font-size: 13px; margin-top: 4px;">
                    Effort: <strong>${student.timeMinutes} mins</strong> | Yield: <strong>${student.score}%</strong>
                </div>
            </div>
            <div style="background: #e11d48; color: white; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                Index: ${student.frustrationScore}
            </div>
        `;
    listContainer.appendChild(card);
  });
}
