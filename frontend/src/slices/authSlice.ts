import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  user: JSON.parse(localStorage.getItem("user")!) || null,
  isLoggedIn: JSON.parse(localStorage.getItem("loginStatus")!) || false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserCredentials: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload;

      localStorage.setItem("loginStatus", JSON.stringify(state.isLoggedIn));
      localStorage.setItem("user", JSON.stringify(state.user));
    },

    logoutUser: (state, _action) => {
      state.isLoggedIn = false;
      state.user = null;

      localStorage.removeItem("loginStatus");
    },
  },
});

export const { logoutUser, setUserCredentials } = authSlice.actions;

export default authSlice.reducer;
