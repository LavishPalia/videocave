import { BASE_URL } from "@/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: [
    "Comment",
    "Like",
    "User",
    "Playlist",
    "Subscription",
    "Tweet",
    "Video",
  ],
  endpoints: (_builder) => ({}),
});
