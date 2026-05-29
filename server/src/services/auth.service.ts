import bcrypt from "bcryptjs";
import { AuthProvider } from "@prisma/client";
import { prisma } from "../config/prisma";
import { generateToken } from "../utils/jwt";
import { AppError } from "../utils/appError";

type RegisterInput = {
    name?: string;
    email: string;
    password: string;
};

type LoginInput = {
    email: string;
    password: string;
};

const SALT_ROUNDS = 10;

const removeSensitiveUserFields = (user: any) => {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
};

export const register = async (input: RegisterInput) => {
    const email = input.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new AppError("User with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            name: input.name,
            email,
            passwordHash,
            provider: AuthProvider.EMAIL,
        },
    });

    const token = generateToken({
        userId: user.id,
        email: user.email,
        provider: user.provider,
    });

    return {
        user: removeSensitiveUserFields(user),
        token,
    };
};

export const login = async (input: LoginInput) => {
    const email = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            provider: true,
            providerAccountId: true,
            passwordHash: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user || user.provider !== AuthProvider.EMAIL || !user.passwordHash) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(
        input.password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken({
        userId: user.id,
        email: user.email,
        provider: user.provider,
    });

    return {
        user: removeSensitiveUserFields(user),
        token,
    };
};

export const getMe = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            provider: true,
            providerAccountId: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return removeSensitiveUserFields(user);
};