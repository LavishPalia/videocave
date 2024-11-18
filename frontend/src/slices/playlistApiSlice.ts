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
  }),
});

export const { useGetUserPlaylistsQuery, useGetPlaylistByIdQuery } =
  playlistApiSlice;
