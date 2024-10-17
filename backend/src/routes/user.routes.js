import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserPassword,
  updateAccountDetails,
  updateUserAvatarImage,
  updateUserCoverImage,
  getLoggedInUser,
  getUserChannelDetails,
  getWatchHistory,
  clearWatchHistory,
  deleteVideoFromWatchHistory,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller.js";
import { check, checkSchema } from "express-validator";

const router = express.Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  [
    check(
      "userName",
      "username should not be empty and without any special characters"
    )
      .trim()
      .isAlphanumeric(),
    check("email", "Please enter a valid email address").trim().isEmail(),
    check(
      "fullName",
      "Full Name must be atleast 3 characters and atmost 50 characters"
    )
      .trim()
      .isLength({ min: 3, max: 50 }),
    check(
      "password",
      "Password must contain one uppercase, one lowercase, one special char, one digit and min 8 chars long"
    )
      .trim()
      .isStrongPassword(),
    checkSchema({
      avatar: {
        custom: {
          options: (_value, { req, path }) => !!req.files[path],
          errorMessage: "Please select an avatar image for your account",
        },
      },
    }),
  ],
  registerUser
);

router
  .route("/login")
  .post(
    [
      check(
        "userName",
        "username should not be empty and without any special characters"
      )
        .trim()
        .isAlphanumeric()
        .optional(),
      check("email", "Please enter a valid email address")
        .trim()
        .isEmail()
        .optional(),
      check("password", "please provide your password").trim().notEmpty(),
    ],
    loginUser
  );

router.route("/logout").post(verifyToken, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

router
  .route("/change-password")
  .post(
    verifyToken,
    [
      check("oldPassword", "Please provide your old password.")
        .trim()
        .notEmpty()
        .isString(),
      check("newPassword", "Please provide your new password.")
        .trim()
        .notEmpty()
        .isString(),
      check("confirmNewPassword", "Please enter your new password again")
        .trim()
        .notEmpty()
        .isString(),
    ],
    updateUserPassword
  );

router
  .route("/update-account")
  .patch(
    verifyToken,
    [
      check("email", "Please enter a valid email address")
        .trim()
        .isEmail()
        .optional(),
      check(
        "fullName",
        "Full Name must be atleast 3 characters and atmost 50 characters"
      )
        .trim()
        .isLength({ min: 3, max: 50 })
        .optional(),
    ],
    updateAccountDetails
  );

router
  .route("/avatar")
  .patch(verifyToken, upload.single("avatar"), updateUserAvatarImage);

router
  .route("/cover-image")
  .patch(verifyToken, upload.single("coverImage"), updateUserCoverImage);

router.route("/current-user").get(verifyToken, getLoggedInUser);
router
  .route("/c/:userName")
  .get(
    verifyToken,
    check(
      "userName",
      "username should not be empty and without any special characters"
    )
      .trim()
      .isAlphanumeric(),
    getUserChannelDetails
  );
router.route("/history").get(verifyToken, getWatchHistory);
router
  .route("/history/clear/:videoId")
  .patch(verifyToken, deleteVideoFromWatchHistory);
router.route("/history/clear-history").patch(verifyToken, clearWatchHistory);

export default router;
