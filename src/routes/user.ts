import { getCurrentUser } from "@/controllers/user";
import { Router } from "express";


const userRouter = Router();

userRouter.get('/current-user', getCurrentUser);


export default userRouter;