// src/api/apiSlice.js
import axios, { AxiosRequestConfig } from "axios";
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

// Define the custom base query
export const fetchBaseQueryWithProgress = ({
  baseUrl,
}: {
  baseUrl: string;
}): BaseQueryFn<
  {
    url: string;
    method: AxiosRequestConfig["method"];
    body?: any;
    headers?: Record<string, string>;
    onProgress?: (progress: number) => void;
  },
  unknown,
  FetchBaseQueryError
> => {
  return async (args, api, _extraOptions) => {
    const { url, method, body, headers, onProgress } = args;

    const state = api.getState() as RootState;
    const accessToken = state.auth.accessToken;

    const source = axios.CancelToken.source();

    try {
      const response = await axios({
        method,
        url: `${baseUrl}${url}`,
        data: body,
        headers: {
          ...headers,
          Authorization: `Bearer ${accessToken}`,
        },
        cancelToken: source.token,
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            onProgress(progress);
          }
        },
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data || error.message };
    }
  };
};

const dynamicBaseQuery: BaseQueryFn<
  {
    url: string;
    method?: AxiosRequestConfig["method"]; // Optional here
    body?: any;
    headers?: Record<string, string>;
    useProgress?: boolean;
    onProgress?: (progress: number) => void;
  },
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const {
    url,
    method = "GET", // Default to 'GET'
    body,
    headers = {},
    useProgress,
    onProgress,
  } = args;

  if (useProgress) {
    return fetchBaseQueryWithProgress({ baseUrl: BASE_URL })(
      { url, method, body, headers, onProgress },
      api,
      extraOptions
    );
  }

  return baseQueryWithReauth({ url, method, body, headers }, api, extraOptions);
};

export const apiSlice = createApi({
  baseQuery: dynamicBaseQuery,
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
