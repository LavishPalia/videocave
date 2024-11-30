import { USERS_URL } from "@/constants";
import { apiSlice } from "./apiSlice";
// import { IResponse, LoginApiReponse } from "@/types";

// type LoginParams = {
//   email: string;
//   password: string;
// };

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // login request to backend
    login: builder.mutation({
      query: (userData) => ({
        url: `${USERS_URL}/login`,
        method: "POST",
        body: userData,
      }),
    }),

    // register request to backend
    register: builder.mutation({
      query: (data) => {
        return {
          url: `${USERS_URL}/register/initial`,
          method: "POST",
          body: data,
        };
      },
    }),

    updateProfileDetails: builder.mutation({
      query: ({ data, onProgress }) => {
        const formData = new FormData();

        formData.append("userName", data.userName);
        formData.append("avatar", data.avatar);
        formData.append("coverImage", data.coverImage);

        return {
          url: `${USERS_URL}/register/complete`,
          method: "POST",
          body: formData,
          headers: { "Content-Type": "multipart/form-data" },
          useProgress: true, // Activate progress tracking
          onProgress, // Pass the progress callback
        };
      },
    }),

    // get current logged in user
    getCurrentUser: builder.query({
      query: () => ({
        url: `${USERS_URL}/current-user`,
      }),
    }),

    // get Users channel details
    getUserChannelDetails: builder.query({
      query: (userId) => ({
        url: `${USERS_URL}/c/${userId}`,
      }),
    }),

    // forgot password request
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/forgot-password`,
        method: "POST",
        body: data,
      }),
    }),

    // Add this to your existing usersApiSlice

    resetPassword: builder.mutation({
      query: ({ token, newPassword }) => ({
        url: `${USERS_URL}/reset-password/${token}`,
        method: "POST",
        body: { newPassword },
      }),
    }),

    // request for verification of email
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: `${USERS_URL}/verify-email/${token}`,
        method: "POST",
      }),
    }),

    // resend verification email
    resendVerificationEmail: builder.mutation({
      query: (data) => {
        return {
          url: `${USERS_URL}/resend-verification-email`,
          method: "POST",
          body: data,
        };
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useGetUserChannelDetailsQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendVerificationEmailMutation,
  useVerifyEmailMutation,
  useUpdateProfileDetailsMutation,
} = usersApiSlice;
