import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        service: "accentIQ API",
        status: "ok",
        database: "not connected yet"
    });
});

export default router;