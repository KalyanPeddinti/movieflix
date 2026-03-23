import { db } from "@workspace/db";
import { conversations, insertConversationSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const convos = await db.query.conversations.findMany({
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
    res.json(convos);
  } catch (err) {
    req.log.error({ err }, "Failed to list conversations");
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = insertConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const [created] = await db
      .insert(conversations)
      .values(parsed.data)
      .returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to create conversation");
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const convo = await db.query.conversations.findFirst({
      where: eq(conversations.id, id),
      with: { messages: { orderBy: (t, { asc }) => [asc(t.createdAt)] } },
    });
    if (!convo) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json(convo);
  } catch (err) {
    req.log.error({ err }, "Failed to get conversation");
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = await db
      .delete(conversations)
      .where(eq(conversations.id, id))
      .returning();
    if (deleted.length === 0) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete conversation");
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

export default router;
