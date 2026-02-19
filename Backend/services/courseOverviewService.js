import fetch from "node-fetch";

export const generateOverview = async (structuredData, totalMinutes) => {
  try {
    const prompt = `
You are a professional course curriculum strategist.

Generate a professional course overview.

STRICT RULES:
- Return ONLY valid JSON.
- No markdown.
- No explanation text.

Return format:

{
  "courseTitle": "string",
  "level": "Beginner/Intermediate/Advanced",
  "totalHours": number,
  "totalSections": number,
  "totalLectures": number,
  "shortDescription": "2-3 lines",
  "skillsCovered": ["skill1", "skill2"],
  "whatYouWillLearn": ["point1", "point2"],
  "targetAudience": "string"
}

Course Structure:
${JSON.stringify(structuredData)}

Total Duration (minutes):
${totalMinutes}
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
    let text = data.candidates[0].content.parts[0].text;

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(text);

  } catch (error) {
    throw new Error("Overview generation failed");
  }
};
