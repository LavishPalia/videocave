import { PLAYLISTS_URL } from "@/constants";
import { apiSlice } from "./apiSlice";

export const playlistApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // request to backend to get users playlists
    getUserPlaylists: builder.query({
      query: (userId) => ({
        url: `${PLAYLISTS_URL}/user/${userId}`,
      }),
    }),

    // get playlist by id
    getPlaylistById: builder.query({
      query: (playlistId) => ({
        url: `${PLAYLISTS_URL}/${playlistId}`,
      }),
    }),

    // fetch all playlist names and video flag
    getVideoFlagAndPlayListNames: builder.query({
      query: (videoId) => ({
        url: `${PLAYLISTS_URL}/contains-video/${videoId}`,
      }),
    }),

    addVideoToPlaylist: builder.mutation({
      query: ({ videoId, playlistId }) => ({
        url: `${PLAYLISTS_URL}/add/${videoId}/${playlistId}`,
        method: "PATCH",
      }),
    }),
    removeVideoFromPlaylist: builder.mutation({
      query: ({ playlistId, videoId }) => ({
        url: `${PLAYLISTS_URL}/remove/${videoId}/${playlistId}`,
        method: "PATCH",
      }),
    }),
  }),
});

export const {
  useGetUserPlaylistsQuery,
  useGetPlaylistByIdQuery,
  useGetVideoFlagAndPlayListNamesQuery,
  useAddVideoToPlaylistMutation,
  useRemoveVideoFromPlaylistMutation,
} = playlistApiSlice;
