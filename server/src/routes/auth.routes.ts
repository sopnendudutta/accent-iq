import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

//google & meta auth router 
router.post("/google", authController.googleAuth);
router.post("/meta", authController.metaAuth);

router.get("/me", authMiddleware, authController.getMe);

router.post("/logout", authController.logout);

export default router;