import { ai } from "@workspace/integrations-gemini-ai";
import { Router } from "express";

const router = Router();

const LANGUAGE_NAMES: Record<string, string> = {
  "en-US": "English",
  "hi-IN": "Hindi",
  "te-IN": "Telugu",
};

router.post("/translate", async (req, res) => {
  try {
    const { texts, targetLanguage } = req.body as {
      texts?: string[];
      targetLanguage?: string;
    };

    if (
      !texts ||
      !Array.isArray(texts) ||
      texts.length === 0 ||
      !targetLanguage
    ) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const langName = LANGUAGE_NAMES[targetLanguage] ?? targetLanguage;

    const prompt = `You are a translation assistant. Translate each of the following numbered messages into ${langName}. 
Keep the same formatting — numbered steps, line breaks, structure — just translate the text.
Do NOT add explanations or extra text. Output ONLY the translations, one per line separated by |||SPLIT|||.

Messages to translate:
${texts.map((t, i) => `[${i + 1}] ${t}`).join("\n\n")}

Output format: translate[1]|||SPLIT|||translate[2]|||SPLIT|||...`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192 },
    });

    const raw = result.text ?? "";
    const parts = raw.split("|||SPLIT|||").map((s) => s.trim());

    const translated = texts.map((original, i) => {
      const t = parts[i];
      return t && t.length > 0 ? t : original;
    });

    res.json({ translated });
  } catch (err) {
    req.log.error({ err }, "Failed to translate messages");
    res.status(500).json({ error: "Translation failed" });
  }
});

export default router;
