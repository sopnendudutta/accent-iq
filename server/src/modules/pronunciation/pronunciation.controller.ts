import { NextFunction, Response } from "express";
import { OptionalAuthRequest } from "../../middleware/optionalAuth.middleware";
import { pronunciationService } from "./pronunciation.service";
import { analyzePronunciationSchema } from "./pronunciation.validation";

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
};