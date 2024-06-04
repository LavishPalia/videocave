import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

await connectDB();

app.listen(process.env.PORT, () =>
  console.log(`server is running on port ${process.env.PORT}`)
);
