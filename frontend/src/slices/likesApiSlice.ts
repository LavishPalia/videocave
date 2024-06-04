import { LIKES_URL } from "@/constants";
import { apiSlice } from "./apiSlice";

export const likesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // request to backend to toggle video like
    toggleVideoLikes: builder.mutation({
      query: (videoId) => ({
        url: `${LIKES_URL}/toggle/v/${videoId}`,
        method: "POST"
      }),
    }),
  }),
});

export const { useToggleVideoLikesMutation } = likesApiSlice;
