/**
 * Fetches student activities for a specific class via GraphQL.
 * Uses a generator loop to mock 50 students with realistic completion rates.
 */
function fetchClassActivitiesGraphQL(classId) {
  try {
    const class1Id = "5df162f6-f4eb-4ef6-bfe7-913a80be9c30";
    const class2Id = "9b3516c1-c0c1-4cab-b07f-a99ec4f7e85b";
    
    const mockList = [];
    let logId = 1;

    // Helper functions for variance
    const randScore = () => Math.floor(Math.random() * 101); 
    const randTime = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    // NEW: Helper function to determine if a student completed the task based on a percentage chance
    const didComplete = (chance) => Math.random() < chance;

    // Generate 50 students for both classes
    for (let i = 1; i <= 50; i++) {
      const studentName = `Student ${i}`;

      // ==========================================
      // CLASS 1: Core Activity (80% Completion Rate)
      // ==========================================
      if (didComplete(0.80)) {
        mockList.push({
          id: `log-${logId++}`,
          learnerId: studentName,
          classId: class1Id,
          itemType: "CORE_TEACHER_ASSIGNED_ACTIVITY",
          activityId: "act-core-c1",
          activityName: "Algebra Core Concepts",
          activityDetails: {
            learningSessionDetails: { score: randScore(), timeSpent: randTime(60, 600) },
          },
        });
      }

      // CLASS 1: Test Activity (90% Completion Rate)
      if (didComplete(0.90)) {
        const c1q1Time = randTime(30, 120); const c1q1Score = randScore();
        const c1q2Time = randTime(30, 120); const c1q2Score = randScore();
        const c1q3Time = randTime(30, 120); const c1q3Score = randScore();
        
        mockList.push({
          id: `log-${logId++}`,
          learnerId: studentName,
          classId: class1Id,
          itemType: "TEACHER_TEST_ACTIVITY",
          activityId: "act-test-c1",
          activityName: "Algebra Midterm Evaluation",
          activityDetails: {
            testSessionDetails: {
              score: Math.round((c1q1Score + c1q2Score + c1q3Score) / 3),
              items: [
                { itemId: "c1-q1", title: "Q1: Variables", score: c1q1Score, timeSpent: c1q1Time },
                { itemId: "c1-q2", title: "Q2: Equations", score: c1q2Score, timeSpent: c1q2Time },
                { itemId: "c1-q3", title: "Q3: Graphing", score: c1q3Score, timeSpent: c1q3Time }
              ],
            },
          },
        });
      }

      // ==========================================
      // CLASS 2: Pathway Activity (65% Completion Rate)
      // ==========================================
      if (didComplete(0.65)) {
        mockList.push({
          id: `log-${logId++}`,
          learnerId: studentName,
          classId: class2Id,
          itemType: "PATHWAY_ACTIVITY",
          activityId: "act-pathway-c2",
          activityName: "Geometry Pathway Journey",
          activityDetails: {
            learningSessionDetails: { score: randScore(), timeSpent: randTime(120, 900) },
          },
        });
      }

      // CLASS 2: Test Activity (85% Completion Rate)
      if (didComplete(0.85)) {
        const c2q1Time = randTime(30, 120); const c2q1Score = randScore();
        const c2q2Time = randTime(30, 120); const c2q2Score = randScore();
        const c2q3Time = randTime(30, 120); const c2q3Score = randScore();
        
        mockList.push({
          id: `log-${logId++}`,
          learnerId: studentName,
          classId: class2Id,
          itemType: "TEACHER_TEST_ACTIVITY",
          activityId: "act-test-c2",
          activityName: "Geometry Midterm Evaluation",
          activityDetails: {
            testSessionDetails: {
              score: Math.round((c2q1Score + c2q2Score + c2q3Score) / 3),
              items: [
                { itemId: "c2-q1", title: "Q1: Angles", score: c2q1Score, timeSpent: c2q1Time },
                { itemId: "c2-q2", title: "Q2: Triangles", score: c2q2Score, timeSpent: c2q2Time },
                { itemId: "c2-q3", title: "Q3: Area", score: c2q3Score, timeSpent: c2q3Time }
              ],
            },
          },
        });
      }
    }

    // Embed the generated list into the GraphQL response structure
    const response = {
      data: {
        getStudentTodoListItems: {
          items: {
            list: mockList,
            hasMore: false,
            cursor: null,
            __typename: "StudentTodoListItemPage",
          },
          __typename: "StudentTodoListItemsResponse",
        },
      },
    };

    // Filter and return just the requested class, exactly like a real API would
    return response.data.getStudentTodoListItems.items.list.filter(
      (i) => i.classId === classId,
    );
    
  } catch (error) {
    console.error("GraphQL fetch failed:", error);
    return []; 
  }
}