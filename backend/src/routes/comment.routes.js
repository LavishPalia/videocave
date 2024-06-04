import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.use(verifyToken);

router.route("/:videoId").get(getVideoComments).post(addComment);

router.route("/c/:commentId").patch(updateComment).delete(deleteComment);

export default router;
