const GEMINI_MODEL = "gemini-2.5-flash-lite";

function buildPrompt({ input, format, tone }) {
  return `
You are SpeakEasy, an AI expression assistant for Chinese international students, especially Chinese postgraduate students in the UK.

You are not a literal translation tool, grammar checker, or generic chatbot.

Task:
Treat the user's input as the meaning they want to express, not as text to translate word-for-word.
Rewrite it into simple, natural, culturally appropriate English for academic communication.
Adapt the output to the selected communication format and tone.

Communication format:
${format}

Tone:
${tone}

User input:
${input}

Rules:
- Produce exactly one recommended English expression.
- Use simple, natural English.
- Preserve the user's real meaning.
- Do not add facts the user did not provide.
- Do not over-apologise.
- If the format is Email, the expression must be formatted as a complete email:
  - First line: "Dear Dr. [Name],"
  - Blank line after the greeting.
  - One short email body paragraph, or two short paragraphs if needed.
  - Final line must be "Best regards," or "Kind regards,".
  - Do not return an email as one plain sentence.
- If the format is Face-to-face, make it natural to say aloud.
- If the format is Text message, keep it short and clear.
- If the format is Teams / Chat, make it concise and quick.
- Explanation and usageTip must be written in Chinese.

Return only valid JSON in this exact shape:
{
  "expression": "recommended English expression",
  "explanation": "中文解释：这句话表达了什么意思",
  "usageTip": "中文建议：适合什么时候使用，是否需要补充信息"
}
`;
}

function extractJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return JSON.parse(trimmed);
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Gemini did not return JSON.");
  }
  return JSON.parse(match[0]);
}

function normalizeExpression(expression, format) {
  const value = String(expression || "").trim();
  if (!format || !format.toLowerCase().includes("email")) {
    return value;
  }

  let email = value;
  if (!/^dear\s+/i.test(email)) {
    email = `Dear Dr. [Name],\n\n${email}`;
  }

  if (!/(best regards,|kind regards,|warm regards,|regards,)\s*$/i.test(email)) {
    email = `${email.replace(/\s+$/g, "")}\n\nBest regards,`;
  }

  return email;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
  }

  const { input, format, tone } = req.body || {};
  if (!input || !format || !tone) {
    return res.status(400).json({ error: "Missing input, format, or tone." });
  }

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: buildPrompt({ input, format, tone }) }]
            }
          ],
          generationConfig: {
            temperature: 0.35,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const message = await geminiResponse.text();
      return res.status(502).json({ error: "Gemini request failed.", detail: message });
    }

    const data = await geminiResponse.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: "Gemini returned an empty response." });
    }

    const parsed = extractJson(text);
    return res.status(200).json({
      expression: normalizeExpression(parsed.expression, format),
      explanation: parsed.explanation || "",
      usageTip: parsed.usageTip || ""
    });
  } catch (error) {
    return res.status(500).json({
      error: "Generation failed.",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
};
