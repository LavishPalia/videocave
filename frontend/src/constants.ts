// export const BASE_URL =
//   process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';

export const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://videocave.onrender.com";

export const USERS_URL = "/api/v1/users";
export const VIDEOS_URL = "/api/v1/videos";
export const SUBSCRIPTIONS_URL = "/api/v1/subscriptions";
export const LIKES_URL = "/api/v1/likes";
export const COMMENTS_URL = "/api/v1/comments";
export const PLAYLISTS_URL = "/api/v1/playlists";
