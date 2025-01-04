import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "@/routes/auth";

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

app.listen(port, async () => {
  console.log(`The application is running on port http://localhost:${port}`);
});
