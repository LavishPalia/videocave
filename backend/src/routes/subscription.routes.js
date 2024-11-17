import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getUserSubscriptions,
  getChannelSubscribers,
  toogleSubscription,
  getLatestVideoFromSubscribedChannels,
} from "../controllers/subscription.controller.js";

const router = express.Router();

router.use(verifyToken);

router
  .route("/c/:channelId")
  .post(toogleSubscription)
  .get(getChannelSubscribers);

router.route("/u/:subscriberId").get(getUserSubscriptions);

router
  .route("/u/:subscriberId/latest")
  .get(getLatestVideoFromSubscribedChannels);

export default router;
