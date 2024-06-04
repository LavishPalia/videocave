import { USERS_URL } from "@/constants";
import { apiSlice } from "./apiSlice";
import { IResponse, LoginApiReponse } from "@/types";

type LoginParams = {
  email: string;
  password: string;
};

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // login request to backend
    login: builder.mutation<IResponse<LoginApiReponse>, LoginParams>({
      query: (userData) => ({
        url: `${USERS_URL}/login`,
        method: "POST",
        body: userData,
      }),
    }),

    // register request to backend
    register: builder.mutation({
      query: (data) => {
        // console.log("usersApi slice register mutation", data);

        const formData = new FormData();

        formData.append("fullName", data.fullName);
        formData.append("userName", data.userName);
        formData.append("password", data.password);
        formData.append("email", data.email);
        formData.append("avatar", data.avatar);
        formData.append("coverImage", data.coverImage);

        return {
          url: `${USERS_URL}/register`,
          method: "POST",
          body: formData,
          formData: true,
          accept: "*/*",
        };
      },
    }),

    // get current loogedin user
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
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useGetUserChannelDetailsQuery,
} = usersApiSlice;
