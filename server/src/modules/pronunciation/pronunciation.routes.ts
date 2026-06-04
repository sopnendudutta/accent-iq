import { Router } from "express";
import { optionalAuth } from "../../middleware/optionalAuth.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { pronunciationController } from "./pronunciation.controller.js";

const router = Router();

router.get("/options", pronunciationController.getOptions);

router.post(
    "/analyze",
    optionalAuth,
    pronunciationController.analyzePronunciation
);

router.get(
    "/favorites",
    authMiddleware,
    pronunciationController.getFavorites
);

router.post(
    "/favorites",
    authMiddleware,
    pronunciationController.addFavorite
);

router.delete(
    "/favorites/:id",
    authMiddleware,
    pronunciationController.deleteFavoriteById
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
    "/history",
    authMiddleware,
    pronunciationController.clearHistory
);

router.delete(
    "/history/:id",
    authMiddleware,
    pronunciationController.deleteHistoryById
);

export default router;