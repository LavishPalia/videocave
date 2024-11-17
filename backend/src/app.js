import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "./middlewares/error.middleware.js";
import morgan from "morgan";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));

const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
const clientUrl =
  process.env.NODE_ENV === "development"
    ? "localhost:5173"
    : "videocave.vercel.app";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", `${protocol}://${clientUrl}`);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// import routes
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import likeRouter from "./routes/like.routes.js";
import commentRouter from "./routes/comment.routes.js";

// mount routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);

app.use(errorHandler);

export default app;
