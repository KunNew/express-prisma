import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "@/routes/auth";
import userRouter from "./routes/user";
import { isAuth } from "./middlewares/auth";
import counterRouter from "./routes/counter";
import lookupRouter from "./routes/lookup";
import roleGroupRouter from "./routes/role-group";
import nextSequenceRouter from "./routes/next-sequence";
import companyRouter from "./routes/company";
// Initiate express
const app = express();

app.use(morgan("dev"));
app.use(
  cors({
    origin: [process.env.APP_URL!, process.env.APP_URL_2!],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const port = process.env.PORT || 8989;

app.use("/api/auth", authRouter);

app.use("/api/users", isAuth, userRouter);

app.use("/api/counters", isAuth, counterRouter);

app.use("/api/lookup", isAuth, lookupRouter);

app.use("/api/role-groups", isAuth, roleGroupRouter);

app.use("/api/next-sequences", isAuth, nextSequenceRouter);

app.use("/api/companies", isAuth, companyRouter);

app.listen(port, async () => {
  console.log(`The application is running on port http://localhost:${port}`);
});
