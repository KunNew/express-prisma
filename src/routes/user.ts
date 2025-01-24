import { createUser, getCurrentUser, getUsers, getUserById, updateUser, deleteUser } from "@/controllers/user";
import { Router } from "express";


const userRouter = Router();

userRouter.get('/current-user', getCurrentUser);

userRouter.get("/", getUsers);

userRouter.post("/", createUser);

userRouter.get("/:id", getUserById);

userRouter.put("/:id", updateUser);

userRouter.delete("/:id", deleteUser);

export default userRouter;
