import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    createUserSchema,
    updateUserSchema,
} from "../validations/user.validation.js";

const router = Router();

router.get("/", userController.getAllUsers);
router.post("/", validate(createUserSchema), userController.createUser);

router.get("/:id", userController.getUserById);
router.patch("/:id", validate(updateUserSchema), userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;