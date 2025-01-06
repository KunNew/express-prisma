import db from "@/client";
import cloudinary from "@/cloud/cludinary";
import generateToken from "@/utils/generateToken";
import { sendErrorResponse } from "@/utils/helper";
import { comparePassword, hashPassword } from "@/utils/password";
import { RequestHandler, response } from "express";
import { StatusCodes } from "http-status-codes";
import { formatImage } from "@/middlewares/multer";
import crypto from "crypto";
import { Resend } from "resend";
import bcrypt from "bcrypt";

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.DOMAIN;

export const register: RequestHandler = async (req, res) => {
  try {
    const newUser = {
      ...req.body,
      profile: {
        avatar: "",
        avatarPublicId: "",
      },
    };

    const hashedPassword = await hashPassword(req.body.password);
    newUser.password = hashedPassword;

    if (req.file) {
      const file = formatImage(req.file);

      const response = await cloudinary.uploader.upload(file!);

      newUser.profile.avatar = response.secure_url;
      newUser.profile.avatarPublicId = response.public_id;
    }

    const user = await db.user.create({
      data: newUser,
    });

    res.status(StatusCodes.CREATED).json({ message: "user created" });
  } catch (error) {
    console.log("register failed", error);
  }
};

export const login: RequestHandler = async (req, res) => {
  const user = await db.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (user && (await comparePassword(req.body.password, user.password))) {
    generateToken(res, `${user.id}`);
    res.json({
      _id: user.id,
      name: user.username,
      email: user.email,
    });
  } else {
    sendErrorResponse({
      res,
      status: StatusCodes.UNAUTHORIZED,
      message: "Invalid email or password",
    });
  }
};

export const reset: RequestHandler = async (req, res) => {
  const existingUser = await db.user.findFirst({
    where: {
      email: req.body.email,
    },
  });

  if (!existingUser) {
    return sendErrorResponse({
      res,
      status: StatusCodes.NOT_FOUND,
      message: "User not found",
    });
  }

  const token = crypto.randomUUID();

  //Hour Expiry
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await db.passwordResetToken.findFirst({
    where: {
      email: req.body.email,
    },
  });
  if (existingToken) {
    await db.passwordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email: req.body.email,
      token,
      expires,
    },
  });

  if (!passwordResetToken) {
    return sendErrorResponse({
      res,
      status: StatusCodes.NOT_FOUND,
      message: "Token not generated",
    });
  }

  const confirmLink = `${process.env.DOMAIN}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: process.env.FROM_EMAIL as string,
    to: req.body.email,
    subject: "Pheak.dev - Confirmation Email",
    html: `<p>Click to <a href='${confirmLink}'>confirm your email</a></p>`,
  });

  res.json({ message: "Reset Email Sent" });
};

export const newPassword: RequestHandler = async (req, res) => {
  //TO CHECK THE TOKEN
  if (!req.body.token) {
    return sendErrorResponse({
      res,
      status: StatusCodes.NOT_FOUND,
      message: "Missing Token",
    });
  }
  //HERE we need to check if the token is valid

  const existingToken = await db.passwordResetToken.findFirst({
    where: {
      token: req.body.token,
    },
  });
  if (!existingToken) {
    return sendErrorResponse({
      res,
      status: StatusCodes.NOT_FOUND,
      message: "Token not found",
    });
  }
  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return sendErrorResponse({
      res,
      status: StatusCodes.BAD_REQUEST,
      message: "Token has expired",
    });
  }

  const existingUser = await db.user.findFirst({
    where: {
      email: existingToken.email,
    },
  });

  if (!existingUser) {
    return sendErrorResponse({
      res,
      status: StatusCodes.NOT_FOUND,
      message: "User not found",
    });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  await db.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      password: hashedPassword,
    },
  });
  await db.passwordResetToken.delete({
    where: {
      id: existingToken.id,
    },
  });
  res.json({ message: "Password updated" });
};
