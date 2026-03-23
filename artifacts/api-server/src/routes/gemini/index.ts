import { Router } from "express";
import conversationsRouter from "./conversations.js";
import messagesRouter from "./messages.js";
import translateRouter from "./translate.js";

const router = Router();

router.use("/conversations", conversationsRouter);
router.use("/conversations", messagesRouter);
router.use("/", translateRouter);

export default router;
