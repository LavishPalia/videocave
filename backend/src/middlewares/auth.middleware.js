import { User } from "../models/User.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyToken = asyncHandler(async (req, _res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log({ accessToken });

    if (!accessToken) {
      return next(new ApiError(401, "unauthorized request"));
    }

    const decodedUser = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedUser._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return next(new ApiError(401, "Invalid access token"));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new ApiError(401, err?.message || "Invalid access token"));
  }
});
