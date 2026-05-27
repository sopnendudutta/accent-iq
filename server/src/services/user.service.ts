import { prisma } from "../config/prisma";

export const getAllUsers = async () => {
  const users = await prisma.user.findMany();

  return users;
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  return user;
};