import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AccentIQ backend is running",
        service: "AccentIQ API",
        status: "ok",
    });
});

export default router;