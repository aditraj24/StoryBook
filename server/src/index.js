import dotenv from "dotenv";
import { app } from "./app.js";
import {connectDB} from "./config/db.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    const server=app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
    server.setTimeout(5 * 60 * 1000); // 5 minutes
  })
  .catch((err) => {
    console.log("DB CONNECTION ERROR. ", err);
  });