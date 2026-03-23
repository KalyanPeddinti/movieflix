import { Router } from "express";
import conversationsRouter from "./conversations.js";
import messagesRouter from "./messages.js";

const router = Router();

router.use("/conversations", conversationsRouter);
router.use("/conversations", messagesRouter);

export default router;
