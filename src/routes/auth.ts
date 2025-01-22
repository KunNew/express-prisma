import { login, logout, newPassword, register, reset } from "@/controllers/auth";
import { isAuth } from "@/middlewares/auth";
import upload from "@/middlewares/multer";
import {
  LoginSchema,
  NewPasswordSchema,
  RegisterSchema,
  validate,
} from "@/middlewares/validator";
import { Router } from "express";
import { z } from "zod";

const authRouter = Router();

authRouter.post(
  "/register",
  upload.single("avatar"),
  validate(RegisterSchema),
  register
);

authRouter.post("/login", validate(LoginSchema), login);

authRouter.post(
  "/reset",
  validate(
    z.object({
      email: z.string().email({
        message: "Email is required",
      }),
    })
  ),
  reset
);

authRouter.post("/new-password", validate(NewPasswordSchema), newPassword);

authRouter.post("/logout", logout);

export default authRouter;
