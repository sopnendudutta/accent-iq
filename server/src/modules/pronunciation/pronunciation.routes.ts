import { Router } from "express";
import { optionalAuth } from "../../middleware/optionalAuth.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { pronunciationController } from "./pronunciation.controller";

const router = Router();

router.post(
    "/analyze",
    optionalAuth,
    pronunciationController.analyzePronunciation
);

router.get(
    "/history",
    authMiddleware,
    pronunciationController.getHistory
);

router.get(
    "/history/:id",
    authMiddleware,
    pronunciationController.getHistoryById
);

router.delete(
    "/history/:id",
    authMiddleware,
    pronunciationController.deleteHistoryById
);

export default router;