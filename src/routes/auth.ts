import { login, register } from "@/controllers/auth";
import { isAuth } from "@/middlewares/auth";
import upload from "@/middlewares/multer";
import { LoginSchema, RegisterSchema, validate } from "@/middlewares/validator";
import { Router } from "express";

const authRouter = Router();

authRouter.post(
  "/register",
  upload.single("avatar"),
  validate(RegisterSchema),
  register
);

authRouter.post("/login", validate(LoginSchema), login);

export default authRouter;
