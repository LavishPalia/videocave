import { USERS_URL } from "@/constants";
import { apiSlice } from "./apiSlice";

export const watchHistoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // login request to backend
    getWatchHistory: builder.query({
      query: () => ({
        url: `${USERS_URL}/history`,
      }),
    }),
    // remove video from watch history request to backend
    deleteVideoFromWatchHistory: builder.mutation({
      query: (videoId) => ({
        url: `${USERS_URL}/history/clear/${videoId}`,
        method: "PATCH",
      }),
    }),

    // clear watch history request to backend
    clearWatchHistory: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/history/clear-history`,
        method: "PATCH",
      }),
    }),
  }),
});

export const {
  useGetWatchHistoryQuery,
  useDeleteVideoFromWatchHistoryMutation,
  useClearWatchHistoryMutation,
} = watchHistoryApiSlice;
