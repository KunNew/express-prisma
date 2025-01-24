import { getNextSequence, setSequence } from "@/controllers/next-sequence";
import { Router } from "express";

const nextSequenceRouter = Router();

nextSequenceRouter.get("/", getNextSequence);

nextSequenceRouter.post("/", setSequence);

export default nextSequenceRouter;
        