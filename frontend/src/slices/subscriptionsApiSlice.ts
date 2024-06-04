import { SUBSCRIPTIONS_URL } from "@/constants";
import { apiSlice } from "./apiSlice";

export const subscriptionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // request to backend to get the list of subscribed channels
    getUserSubscriptions: builder.query({
      query: (subscriberId) => ({
        url: `${SUBSCRIPTIONS_URL}/u/${subscriberId}`,
      }),
    }),

    // request to toggle the channel subscription
    toggleSubscription: builder.mutation({
      query: (userId) => ({
        url: `${SUBSCRIPTIONS_URL}/c/${userId}`,
        method: "POST",
      }),
    }),
  }),
});

export const { useGetUserSubscriptionsQuery, useToggleSubscriptionMutation } =
  subscriptionsApiSlice;
