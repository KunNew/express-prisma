import { RequestHandler } from "express";
import db from "@/client";
import { StatusCodes } from "http-status-codes";
import { sendErrorResponse } from "@/utils/helper";
import { format } from "date-fns";
import { hashPassword } from "@/utils/password";
import { Prisma } from "@prisma/client";

export const getCurrentUser: RequestHandler = async (req, res) => {
  const user = await db.user.findFirst({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      email: true,
      username: true,
      password: false,
    },
  });

  res.status(StatusCodes.OK).json({ user });
};

export const getUsers: RequestHandler = async (req, res) => {
  const { page = 1, pageSize = 10, search = "" } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const users = await db.user.findMany({
    skip,
    take: Number(pageSize),
    where: {
      profile: {
        isNot: {
          roleGroup: {
            has: "super",
          },
        },
      },
      OR: [
        { email: { contains: String(search), mode: "insensitive" } },
        { username: { contains: String(search), mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!users) {
    return sendErrorResponse({
      message: "No users found",
      status: 404,
      res,
    });
  }

  const formattedUsers = users.map((user) => ({
    ...user,
    createdAt: format(new Date(user.createdAt), "dd-MM-yyyy"),
    updatedAt: format(new Date(user.updatedAt), "dd-MM-yyyy"),
  }));

  const total = await db.user.count();

  res.status(StatusCodes.OK).json({ users: formattedUsers, total });
};

export const createUser: RequestHandler = async (req, res) => {
  try {
    const { email, username, password, roleGroup, permissions, status } =
      req.body;
    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        profile: {
          create: {
            roleGroup: [roleGroup],
            permissions: permissions,
            status,
          },
        },
      },
    });
    res.status(StatusCodes.CREATED).json({ user });
  } catch (error: any) {
    // Check if error is from Prisma
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return sendErrorResponse({
        message: "Email already exists",
        status: StatusCodes.CONFLICT,
        res,
      });
    }
    return sendErrorResponse({
      message: "Failed to create user",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      res,
    });
  }
};

export const getUserById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      profile: true,
    },
  });
  if (!user) {
    return sendErrorResponse({
      message: "User not found",
      status: StatusCodes.NOT_FOUND,
      res,
    });
  }
  res.status(StatusCodes.OK).json({ user });
};

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, username, password, status, permissions, roleGroup } =
      req.body;
    const hashedPassword = await hashPassword(password);
    const user = await db.user.update({
      where: { id },
      data: {
        email,
        username,
        password: hashedPassword,
        profile: {
          create: {
            status,
            permissions,
            roleGroup: [roleGroup],
          },
        },
      },
    });
    res
      .status(StatusCodes.OK)
      .json({ message: "User updated successfully", user });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return sendErrorResponse({
        message: "Email already exists",
        status: StatusCodes.CONFLICT,
        res,
      });
    }
    return sendErrorResponse({
      message: "Failed to update user",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      res,
    });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    return sendErrorResponse({
      message: "User not found",
      status: StatusCodes.NOT_FOUND,
      res,
    });
  }
  await db.user.delete({ where: { id } });
  res
    .status(StatusCodes.OK)
    .json({ message: "User deleted successfully", user });
};
