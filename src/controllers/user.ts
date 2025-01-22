import { RequestHandler } from "express";
import db from "@/client";
import { StatusCodes } from "http-status-codes";

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
