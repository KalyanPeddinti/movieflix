import { ai } from "@workspace/integrations-gemini-ai";
import { db } from "@workspace/db";
import {
  conversations,
  messages,
  insertMessageSchema,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { Router } from "express";

const router = Router();

const SYSTEM_PROMPT = `You are ElderAssist, a warm, patient, and helpful phone settings assistant designed specifically for elderly users who may not be familiar with modern smartphones.

Your role is to help users change phone settings by providing VERY clear, step-by-step instructions. When a user asks you to help with a phone setting (like connecting Bluetooth, adjusting brightness, changing volume, enabling Wi-Fi, etc.), you should:

1. Acknowledge their request warmly and confirm what they want to do
2. Provide numbered, step-by-step instructions in very simple language
3. Keep each step short — one action per step
4. Avoid technical jargon; use plain, everyday words
5. Mention what they will SEE on the screen at each step
6. If unsure about their phone type (iPhone or Android), ask first or provide instructions for both
7. At the end, ask if they were able to complete the steps successfully
8. If they had trouble, offer to try an alternative approach

Always be patient, encouraging, and never make the user feel bad for asking. You are their trusted helper.`;

router.get("/:id/messages", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const msgs = await db.query.messages.findMany({
      where: eq(messages.conversationId, id),
      orderBy: (t, { asc }) => [asc(t.createdAt)],
    });
    res.json(msgs);
  } catch (err) {
    req.log.error({ err }, "Failed to list messages");
    res.status(500).json({ error: "Failed to list messages" });
  }
});

router.post("/:id/messages", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const convo = await db.query.conversations.findFirst({
      where: eq(conversations.id, id),
    });
    if (!convo) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    const parsed = insertMessageSchema
      .pick({ content: true })
      .safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    await db
      .insert(messages)
      .values({
        conversationId: id,
        role: "user",
        content: parsed.data.content,
      });

    const allMessages = await db.query.messages.findMany({
      where: eq(messages.conversationId, id),
      orderBy: (t, { asc }) => [asc(t.createdAt)],
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    let fullResponse = "";

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        {
          role: "model",
          parts: [
            {
              text: "Understood! I'm ElderAssist, ready to help you with your phone settings in a clear, step-by-step way.",
            },
          ],
        },
        ...allMessages.map((m) => ({
          role: m.role === "assistant" ? ("model" as const) : ("user" as const),
          parts: [{ text: m.content }],
        })),
      ],
      config: { maxOutputTokens: 8192 },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    await db.insert(messages).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    res.write(
      `data: ${JSON.stringify({ error: "Failed to get AI response" })}\n\n`
    );
    res.end();
  }
});

export default router;
