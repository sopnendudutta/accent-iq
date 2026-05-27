import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string().trim().min(1, "Name cannot be empty").optional(),

    email: z
        .string()
        .trim()
        .email("Please provide a valid email address"),

    imageUrl: z
        .string()
        .trim()
        .url("Image URL must be a valid URL")
        .optional(),

    provider: z.enum(["GOOGLE", "META", "EMAIL"]),
});

export const updateUserSchema = createUserSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required for update",
    }
);

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;