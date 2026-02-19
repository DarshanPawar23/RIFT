export const generateExamQuestions = async (courseTitle, structuredCourse) => {
  try {

    const topics = structuredCourse
      .map(section => section.sectionTitle)
      .join(", ");

    const prompt = `
You are a professional exam creator.

Create 40 high-quality multiple choice questions for the course:

Course Title: ${courseTitle}

Topics Covered:
${topics}

Rules:
- Return ONLY valid JSON
- No markdown
- No explanation
- 40 questions
- Each question must have:
    "question"
    "options" (array of 4 strings)
    "correctIndex" (0-3)

Return format:

[
  {
    "question": "What is HTML?",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 1
  }
]
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite-001:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message);
    }

    let text = data.candidates[0].content.parts[0].text;

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const first = text.indexOf("[");
    const last = text.lastIndexOf("]");

    const jsonString = text.substring(first, last + 1);

    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Exam generation error:", error.message);
    throw error;
  }
};
