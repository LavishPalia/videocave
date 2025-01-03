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

    getUserPlaylistNames: builder.query({
      query: (userId) => ({
        url: `${PLAYLISTS_URL}/user/${userId}/playlistNames`,
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
      query: ({ videoId, playlistId }) => ({
        url: `${PLAYLISTS_URL}/remove/${videoId}/${playlistId}`,
        method: "PATCH",
      }),
    }),

    // crete new playlist
    createPlaylist: builder.mutation({
      query: (data) => ({
        url: PLAYLISTS_URL,
        method: "POST",
        body: data,
      }),
    }),

    // delete playlist
    deletePlaylist: builder.mutation({
      query: (playlistId) => ({
        url: `${PLAYLISTS_URL}/${playlistId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetUserPlaylistsQuery,
  useGetUserPlaylistNamesQuery,
  useGetPlaylistByIdQuery,
  useGetVideoFlagAndPlayListNamesQuery,
  useAddVideoToPlaylistMutation,
  useRemoveVideoFromPlaylistMutation,
  useCreatePlaylistMutation,
  useDeletePlaylistMutation,
} = playlistApiSlice;
