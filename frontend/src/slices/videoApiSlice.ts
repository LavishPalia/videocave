import { VIDEOS_URL } from "@/constants";
import { apiSlice } from "./apiSlice";

export const videosApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // request to backend to get all videos
    getAllVideos: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `${VIDEOS_URL}?page=${page}&limit=${limit}&sortBy=createdAt&sortType=-1`,
      }),
    }),

    // request to backend to get a single video
    getVideoById: builder.query({
      query: (videoId) => ({
        url: `${VIDEOS_URL}/${videoId}`,
      }),
    }),

    // request to backend to get a single video
    getPublishedVideosByChannel: builder.query({
      query: ({ userId, sortBy, sortType }) => ({
        url: `${VIDEOS_URL}/u/${userId}/published?sortBy=${sortBy}&sortType=${sortType}`,
      }),
    }),

    getVideosDataByChannel: builder.query({
      query: (userId) => ({
        url: `${VIDEOS_URL}/u/${userId}/all`,
      }),
    }),

    publishVideo: builder.mutation({
      query: ({ data, onProgress }) => {
        const formData = new FormData();

        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("thumbnail", data.thumbnail);
        formData.append("videoFile", data.videoFile);
        formData.append("playlistIds", JSON.stringify(data.playlistIds)); // Convert array to JSON string
        formData.append("visibility", data.visibility);

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

    updateVideo: builder.mutation({
      query: ({ data }) => {
        const formData = new FormData();

        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("thumbnail", data.thumbnail);
        formData.append("playlistIds", JSON.stringify(data.playlistIds)); // Convert array to JSON string
        formData.append("visibility", data.visibility);

        return {
          url: `${VIDEOS_URL}/${data._id}`,
          method: "PATCH",
          body: formData,
        };
      },
    }),

    searchVideosAndChannels: builder.query({
      query: (query) => ({
        url: `${VIDEOS_URL}/search?query=${query}`,
      }),
    }),
  }),
});

export const {
  useGetAllVideosQuery,
  useGetVideoByIdQuery,
  useGetPublishedVideosByChannelQuery,
  usePublishVideoMutation,
  useUpdateVideoMutation,
  useGetVideosDataByChannelQuery,
  useSearchVideosAndChannelsQuery,
} = videosApiSlice;
