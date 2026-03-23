import { ai } from "@workspace/integrations-gemini-ai";
import { db } from "@workspace/db";
import {
  conversations,
  messages,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { Router } from "express";

const router = Router();

const BASE_SYSTEM_PROMPT = `You are ElderAssist, a warm, patient, and helpful phone settings assistant designed specifically for elderly users who may not be familiar with modern smartphones.

IMPORTANT LANGUAGE RULE: Always detect the language of the user's message and reply in THAT SAME LANGUAGE. If the user writes in Hindi, respond entirely in Hindi. If the user writes in Telugu, respond entirely in Telugu. If the user writes in English, respond in English. Never switch languages mid-reply.

Your role is to help users change phone settings by providing VERY clear, step-by-step instructions. When a user asks you to help with a phone setting (like connecting Bluetooth, adjusting brightness, changing volume, enabling Wi-Fi, etc.), you should:

1. Acknowledge their request warmly and confirm what they want to do
2. Provide numbered, step-by-step instructions in very simple language
3. Keep each step short — one action per step
4. Avoid technical jargon; use plain, everyday words
5. Mention EXACTLY what the user will SEE on the screen at each step (specific menu names, button labels, icons)
6. At the end, ask if they were able to complete the steps successfully
7. If they had trouble, offer to try an alternative approach

Always be patient, encouraging, and never make the user feel bad for asking. You are their trusted helper.`;

function buildSystemPrompt(deviceInfo?: {
  model: string;
  manufacturer: string;
  osName: string;
  osVersion: string;
}): string {
  if (!deviceInfo || deviceInfo.osName === "Web") {
    return BASE_SYSTEM_PROMPT;
  }

  const { model, manufacturer, osName, osVersion } = deviceInfo;
  const isIos = osName.toLowerCase().includes("ios");
  const isSamsung = manufacturer.toLowerCase().includes("samsung");
  const isPixel = manufacturer.toLowerCase().includes("google") || model.toLowerCase().includes("pixel");

  let deviceContext = `\n\nDEVICE INFORMATION (automatically detected):\n`;
  deviceContext += `- Phone model: ${model}\n`;
  deviceContext += `- Manufacturer: ${manufacturer}\n`;
  deviceContext += `- Operating system: ${osName} ${osVersion}\n`;
  deviceContext += `\nIMPORTANT: You ALREADY KNOW their exact phone. Do NOT ask what phone they have. Give instructions specifically for the ${model} running ${osName} ${osVersion}.\n`;

  if (isIos) {
    deviceContext += `\nNAVIGATION PATHS FOR THIS DEVICE (iPhone with iOS ${osVersion}):\n`;
    deviceContext += `- Bluetooth: Settings → Bluetooth → toggle ON → tap device name\n`;
    deviceContext += `- Wi-Fi: Settings → Wi-Fi → toggle ON → tap network name\n`;
    deviceContext += `- Volume/Ringtone: Settings → Sounds & Haptics → drag Ringer slider\n`;
    deviceContext += `- Brightness: Settings → Display & Brightness → drag brightness slider\n`;
    deviceContext += `- Do Not Disturb: Settings → Focus → Do Not Disturb → toggle ON\n`;
    deviceContext += `- Battery saver: Settings → Battery → Low Power Mode → toggle ON\n`;
  } else if (isSamsung) {
    deviceContext += `\nNAVIGATION PATHS FOR THIS DEVICE (Samsung ${model} with One UI ${osVersion}):\n`;
    deviceContext += `- Bluetooth: Settings → Connections → Bluetooth → toggle ON → tap device\n`;
    deviceContext += `- Wi-Fi: Settings → Connections → Wi-Fi → toggle ON → tap network\n`;
    deviceContext += `- Volume: Settings → Sounds and vibration → drag volume slider\n`;
    deviceContext += `- Brightness: Settings → Display → drag brightness slider at top\n`;
    deviceContext += `- Do Not Disturb: Settings → Modes and Routines → Do not disturb → toggle ON\n`;
    deviceContext += `- Battery saver: Settings → Battery and device care → Battery → Power saving → toggle ON\n`;
  } else if (isPixel) {
    deviceContext += `\nNAVIGATION PATHS FOR THIS DEVICE (Google ${model} with Android ${osVersion}):\n`;
    deviceContext += `- Bluetooth: Settings → Connected devices → Pair new device → tap device name\n`;
    deviceContext += `- Wi-Fi: Settings → Network & internet → Internet → tap network name\n`;
    deviceContext += `- Volume: Settings → Sound & vibration → drag Media volume slider\n`;
    deviceContext += `- Brightness: Settings → Display → Brightness level → drag slider\n`;
    deviceContext += `- Do Not Disturb: Settings → Notifications → Do Not Disturb → toggle ON\n`;
    deviceContext += `- Battery saver: Settings → Battery → Battery Saver → Use Battery Saver → toggle ON\n`;
  } else {
    deviceContext += `\nNAVIGATION PATHS FOR THIS DEVICE (Android ${osVersion} on ${manufacturer}):\n`;
    deviceContext += `- Bluetooth: Settings → Connected devices → Bluetooth → toggle ON\n`;
    deviceContext += `- Wi-Fi: Settings → Network & internet → Wi-Fi → tap network\n`;
    deviceContext += `- Volume: Settings → Sound → drag volume slider\n`;
    deviceContext += `- Brightness: Settings → Display → Brightness → drag slider\n`;
    deviceContext += `- Do Not Disturb: Settings → Sound → Do Not Disturb → toggle ON\n`;
    deviceContext += `- Battery saver: Settings → Battery → Battery Saver → toggle ON\n`;
  }

  return BASE_SYSTEM_PROMPT + deviceContext;
}

interface DeviceInfoBody {
  model: string;
  manufacturer: string;
  osName: string;
  osVersion: string;
}

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

    const { content, deviceInfo } = req.body as {
      content?: string;
      deviceInfo?: DeviceInfoBody;
    };

    if (!content || typeof content !== "string" || !content.trim()) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    await db.insert(messages).values({
      conversationId: id,
      role: "user",
      content,
    });

    const allMessages = await db.query.messages.findMany({
      where: eq(messages.conversationId, id),
      orderBy: (t, { asc }) => [asc(t.createdAt)],
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const systemPrompt = buildSystemPrompt(deviceInfo);
    let fullResponse = "";

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        {
          role: "model",
          parts: [{ text: "Understood! I'm ElderAssist, ready to help you with your specific phone settings in a clear, step-by-step way." }],
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
    res.write(`data: ${JSON.stringify({ error: "Failed to get AI response" })}\n\n`);
    res.end();
  }
});

export default router;
