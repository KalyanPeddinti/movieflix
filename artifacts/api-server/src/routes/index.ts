import { Router, type IRouter } from "express";
import healthRouter from "./health";
import geminiRouter from "./gemini/index.js";
import moviesRouter from "./movies.js";
import authRouter from "./auth.js";
import watchlistRouter from "./watchlist.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/gemini", geminiRouter);
router.use("/movies", moviesRouter);
router.use("/my-list", watchlistRouter);

export default router;
