// src/api/apiSlice.js

import { BASE_URL } from "@/constants";
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { setUserCredentials, logoutUser } from "@/slices/authSlice"; // Update with your auth slice actions
import { RootState } from "@/app/store";
import { checkIfTokenNeedsRefresh } from "@/utils/tokenUtils";

// A custom baseQuery with error handling for 401
export const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
});

let isRefreshing = false;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;
  const accessToken = state.auth.accessToken!;
  const refreshToken = state.auth.refreshToken!;

  if (accessToken && checkIfTokenNeedsRefresh(accessToken) && !isRefreshing) {
    isRefreshing = true;

    console.info("Token nearing expiry, refreshing...");

    const refreshResult = await baseQuery(
      {
        url: "/api/v1/users/refresh-token",
        method: "POST",
        body: refreshToken,
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      console.info("Token refreshed successfully");
      console.log(refreshResult.data);

      const responseData = refreshResult.data as { data?: any };
      api.dispatch(setUserCredentials(responseData?.data));
    } else {
      console.error("Token refresh failed");
      api.dispatch(logoutUser("Session expired, please login again")); // Log the user out
      window.location.href = "/login"; // Redirect to login page
      isRefreshing = false; // Release the lock after failure
      return refreshResult; // Exit with the refresh error
    }

    isRefreshing = false; // Release the lock after the refresh request completes
  }

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.error("Unauthorized! Logging out...");
    api.dispatch(logoutUser("Session expired, please login again"));
    window.location.href = "/login"; // Redirect to login
  }

  return result;
};
export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
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
