import { User } from "@prisma/client";
import { Request, Response } from "express";

type ErrorResponseType = {
  res: Response;
  message: string;
  status: number;
};

export const sendErrorResponse = ({
  res,
  message,
  status,
}: ErrorResponseType) => {
  res.status(status).json({ message });
};

export const formatUserProfile = (user: User): Request["user"] => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
};
