import { COMMENTS_URL } from "@/constants";
import { apiSlice } from "./apiSlice";

export const commentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // get all comments on a video
    getVideoComments: builder.query({
      query: (videoId) => ({
        url: `${COMMENTS_URL}/${videoId}`,
      }),
    }),

    addComment: builder.mutation({
      query: ({ videoId, comment }) => {
        return {
          url: `${COMMENTS_URL}/${videoId}`,
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set Content-Type header
          },
          body: JSON.stringify({ comment }),
        };
      },
    }),
  }),
});

export const { useGetVideoCommentsQuery, useAddCommentMutation } =
  commentsApiSlice;
