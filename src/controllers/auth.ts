import db from "@/client";
import cloudinary from "@/cloud/cludinary";
import generateToken from "@/utils/generateToken";
import { sendErrorResponse } from "@/utils/helper";
import { comparePassword, hashPassword } from "@/utils/password";
import { RequestHandler, response } from "express";
import { StatusCodes } from "http-status-codes";
import { formatImage } from "@/middlewares/multer";

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
