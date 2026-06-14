import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

// Google OAuth uses browser redirects. Meta remains intentionally unimplemented.
router.get("/google", authController.startGoogleAuth);
router.get("/google/callback", authController.handleGoogleCallback);
router.post("/google/exchange", authController.exchangeGoogleAuth);
router.post("/meta", authController.metaAuth);

router.get("/me", authMiddleware, authController.getMe);

router.post("/logout", authController.logout);

export default router;
