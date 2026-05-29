import { Router } from "express";
import { optionalAuth } from "../../middleware/optionalAuth.middleware";
import { pronunciationController } from "./pronunciation.controller";

const router = Router();

router.post(
    "/analyze",
    optionalAuth,
    pronunciationController.analyzePronunciation
);

export default router;