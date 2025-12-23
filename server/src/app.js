import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import storyRouter from "./routes/story.route.js";
import fs from "fs";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use((req, res, next) => {
  res.on("finish", () => {
    if (req.files) {
      Object.values(req.files)
        .flat()
        .forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlink(file.path, () => {});
          }
        });
    }
  });
  next();
});
//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/stories", storyRouter);

export { app };
