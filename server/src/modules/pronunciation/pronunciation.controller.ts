import { NextFunction, Request, Response } from "express";
import type { JwtPayloadData } from "../../utils/jwt";
import { pronunciationService } from "./pronunciation.service";
import {
    analyzePronunciationSchema,
    pronunciationHistoryIdSchema,
} from "./pronunciation.validation";

type RequestWithUser = Request & {
    user?: JwtPayloadData;
};

const getUserId = (req: Request): string | undefined => {
    const authReq = req as RequestWithUser;
    return authReq.user?.userId;
};

export const pronunciationController = {
    getOptions: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const options = await pronunciationService.getOptions();

            res.status(200).json({
                success: true,
                message: "Pronunciation options fetched successfully",
                data: options,
            });
        } catch (error) {
            next(error);
        }
    },

    analyzePronunciation: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const validatedData = analyzePronunciationSchema.parse({
                body: req.body,
            });

            if (validatedData.body.inputType === "VOICE") {
                return res.status(501).json({
                    success: false,
                    message:
                        "Voice pronunciation input is planned but not enabled yet. Use TEXT input for now.",
                });
            }

            const userId = getUserId(req);

            const result = await pronunciationService.analyzePronunciation(
                validatedData.body,
                userId
            );

            res.status(200).json({
                success: true,
                message: "Pronunciation analyzed successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },

    getHistory: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = getUserId(req);

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const history = await pronunciationService.getHistory(userId);

            res.status(200).json({
                success: true,
                message: "Pronunciation history fetched successfully",
                data: history,
            });
        } catch (error) {
            next(error);
        }
    },

    getHistoryById: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = getUserId(req);

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const validatedData = pronunciationHistoryIdSchema.parse({
                params: req.params,
            });

            const historyItem = await pronunciationService.getHistoryById(
                validatedData.params.id,
                userId
            );

            if (!historyItem) {
                return res.status(404).json({
                    success: false,
                    message: "Pronunciation history item not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Pronunciation history item fetched successfully",
                data: historyItem,
            });
        } catch (error) {
            next(error);
        }
    },

    deleteHistoryById: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = getUserId(req);

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const validatedData = pronunciationHistoryIdSchema.parse({
                params: req.params,
            });

            const deletedItem = await pronunciationService.deleteHistoryById(
                validatedData.params.id,
                userId
            );

            if (!deletedItem) {
                return res.status(404).json({
                    success: false,
                    message: "Pronunciation history item not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Pronunciation history item deleted successfully",
                data: deletedItem,
            });
        } catch (error) {
            next(error);
        }
    },
};