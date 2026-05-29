import { NextFunction, Response } from "express";
import { OptionalAuthRequest } from "../../middleware/optionalAuth.middleware";
import { pronunciationService } from "./pronunciation.service";
import {
    analyzePronunciationSchema,
    pronunciationHistoryIdSchema,
} from "./pronunciation.validation";

export const pronunciationController = {
    analyzePronunciation: async (
        req: OptionalAuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const validatedData = analyzePronunciationSchema.parse({
                body: req.body,
            });

            const result = await pronunciationService.analyzePronunciation(
                validatedData.body,
                req.user?.id
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
        req: OptionalAuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (!req.user?.id) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const history = await pronunciationService.getHistory(req.user.id);

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
        req: OptionalAuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (!req.user?.id) {
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
                req.user.id
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
        req: OptionalAuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (!req.user?.id) {
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
                req.user.id
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