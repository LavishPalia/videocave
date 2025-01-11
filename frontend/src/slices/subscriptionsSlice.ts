import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ISubscription {
  _id: string;
  userName: string;
  fullName: string;
  avatar: string;
}

const initialState: ISubscription[] = [];

const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    saveUserSubscriptions: (
      _state: ISubscription[],
      action: PayloadAction<ISubscription[]>
    ) => {
      return action.payload;
    },
  },
});

export const { saveUserSubscriptions } = subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;
