import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  getPublishedVideosByChannel,
  publishVideo,
  togglePublishStatus,
  updateVideo,
  getVideosDataByChannel,
  searchVideosAndChannels,
} from "../controllers/video.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);
router.route("/").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
);

router.route("/u/:userId/published").get(getPublishedVideosByChannel);
router.route("/u/:userId/all").get(getVideosDataByChannel);

router.route("/search").get(searchVideosAndChannels);

router
  .route("/:videoId")
  .get(getVideoById)
  .patch(upload.single("thumbnail"), updateVideo)
  .delete(deleteVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

router.route("/").get(getAllVideos);

export default router;
