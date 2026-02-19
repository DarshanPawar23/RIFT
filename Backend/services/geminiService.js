export const generateStructure = async (videoData) => {
  try {
    const prompt = `
You are a professional curriculum architect.

Organize this list of YouTube videos into structured learning sections.

STRICT RULES:
- Return ONLY valid JSON.
- No markdown.
- No explanation text.
- Group videos into logical learning sections.
- Each section must contain:
    "sectionTitle": string
    "videos": array
- Each video must contain:
    "title", "videoId", "status"
- First video overall must have status "playing".
- All others must have status "upcoming".

Return format example:

[
  {
    "sectionTitle": "Section Name",
    "videos": [
      {
        "title": "Video Title",
        "videoId": "abc123",
        "status": "playing"
      }
    ]
  }
]

Videos:
${JSON.stringify(videoData)}
`;


    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite-001:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini HTTP Error:", data);
      throw new Error(data.error?.message || "Gemini API failed");
    }

    if (!data.candidates || data.candidates.length === 0) {
      console.error("Gemini Empty Response:", data);
      throw new Error("Gemini returned empty response");
    }

    let text = data.candidates[0].content.parts[0].text;

    if (!text) {
      throw new Error("Gemini returned empty text");
    }

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // Extract JSON array safely
    const firstBracket = text.indexOf("[");
    const lastBracket = text.lastIndexOf("]");

    if (firstBracket === -1 || lastBracket === -1) {
      console.error("Invalid AI format:", text);
      throw new Error("AI did not return JSON array");
    }

    const jsonString = text.substring(firstBracket, lastBracket + 1);

    try {
      const parsed = JSON.parse(jsonString);

      if (!Array.isArray(parsed)) {
        throw new Error("AI response is not an array");
      }

      return parsed;
    } catch (parseError) {
      console.error("JSON Parse Error:", jsonString);
      throw new Error("AI returned invalid JSON format");
    }

  } catch (error) {
    console.error("Gemini Service Error:", error.message);
    throw error;
  }
};
