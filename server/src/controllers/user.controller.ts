import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import type {
    CreateUserInput,
    UpdateUserInput,
} from "../validations/user.validation";

export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const users = await userService.getAllUsers();

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const user = await userService.getUserById(id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (
    req: Request<{}, {}, CreateUserInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const existingUser = await userService.getUserByEmail(req.body.email);

        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
            return;
        }

        const user = await userService.createUser(req.body);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (
    req: Request<{ id: string }, {}, UpdateUserInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const existingUser = await userService.getUserById(id);

        if (!existingUser) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        if (req.body.email) {
            const userWithSameEmail = await userService.getUserByEmail(
                req.body.email
            );

            if (userWithSameEmail && userWithSameEmail.id !== id) {
                res.status(409).json({
                    success: false,
                    message: "Email is already used by another user",
                });
                return;
            }
        }

        const updatedUser = await userService.updateUser(id, req.body);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const existingUser = await userService.getUserById(id);

        if (!existingUser) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        const deletedUser = await userService.deleteUser(id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: deletedUser,
        });
    } catch (error) {
        next(error);
    }
};