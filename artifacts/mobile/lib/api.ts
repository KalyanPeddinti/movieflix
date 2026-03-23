import { fetch } from "expo/fetch";
import { getApiUrl } from "./query-client";

export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(`${getApiUrl()}api/gemini/conversations`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function createConversation(title: string): Promise<Conversation> {
  const res = await fetch(`${getApiUrl()}api/gemini/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
}

export async function deleteConversation(id: number): Promise<void> {
  const res = await fetch(`${getApiUrl()}api/gemini/conversations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204)
    throw new Error("Failed to delete conversation");
}

export async function fetchConversation(
  id: number
): Promise<ConversationWithMessages> {
  const res = await fetch(`${getApiUrl()}api/gemini/conversations/${id}`);
  if (!res.ok) throw new Error("Failed to fetch conversation");
  return res.json();
}

export interface DeviceInfoPayload {
  model: string;
  manufacturer: string;
  osName: string;
  osVersion: string;
}

export async function streamMessage(
  conversationId: number,
  content: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (msg: string) => void,
  deviceInfo?: DeviceInfoPayload
): Promise<void> {
  const response = await fetch(
    `${getApiUrl()}api/gemini/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ content, deviceInfo }),
    }
  );

  if (!response.ok) throw new Error("Failed to send message");

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      try {
        const parsed = JSON.parse(data);
        if (parsed.content) onChunk(parsed.content);
        if (parsed.done) onDone();
        if (parsed.error) onError(parsed.error);
      } catch {}
    }
  }
}
