import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getLikedVideos,
  getVideoLikeCount,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";

const router = express.Router();

router.use(verifyToken);

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);
router.route("/v/:videoId").get(getVideoLikeCount);

export default router;
