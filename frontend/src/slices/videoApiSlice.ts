import { VIDEOS_URL } from "@/constants";
import { apiSlice } from "./apiSlice";

export const videosApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // request to backend to get all videos
    getAllVideos: builder.query({
      query: () => ({
        url: VIDEOS_URL,
      }),
    }),

    // request to backend to get a single video
    getVideoById: builder.query({
      query: (videoId) => ({
        url: `${VIDEOS_URL}/${videoId}`,
      }),
    }),

    // request to backend to get a single video
    getChannelVideos: builder.query({
      query: (userId) => ({
        url: `${VIDEOS_URL}/u/${userId}`,
      }),
    }),

    publishVideo: builder.mutation({
      query: ({ data, onProgress }) => {
        console.log("videosApiSlice pulish video mutation: 29", data);

        const formData = new FormData();

        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("thumbnail", data.thumbnail);
        formData.append("videoFile", data.videoFile);

        return {
          url: VIDEOS_URL,
          method: "POST",
          body: formData,
          headers: { "Content-Type": "multipart/form-data" },
          useProgress: true, // Activate progress tracking
          onProgress, // Pass the progress callback
        };
      },
    }),
  }),
});

export const {
  useGetAllVideosQuery,
  useGetVideoByIdQuery,
  useGetChannelVideosQuery,
  usePublishVideoMutation,
} = videosApiSlice;
