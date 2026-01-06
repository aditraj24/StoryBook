import { Router } from "express";
import { aiController } from "../controllers/ai.controller.js";

const router = Router();

router.post("/chat", aiController);

export default router;
