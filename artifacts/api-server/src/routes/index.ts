import { Router, type IRouter } from "express";
import healthRouter from "./health";
import geminiRouter from "./gemini/index.js";
import moviesRouter from "./movies.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/gemini", geminiRouter);
router.use("/movies", moviesRouter);

export default router;
