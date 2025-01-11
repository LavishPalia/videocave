// src/main.tsx

import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import store, { persistor } from "./app/store.ts";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import PrivateRoutes from "./components/PrivateRoutes";
import HomeScreen from "./screens/HomeScreen";
import VideoPlayerScreen from "./screens/VideoPlayerScreen";
import History from "./screens/History";
import Channel from "./screens/Channel";
import ForgetPassword from "./screens/ForgetPassword.tsx";
import ResetPassword from "./screens/ResetPassword.tsx";
import EmailVerificationConfirmation from "./screens/EmailVerificationConfirmation.tsx";
import VerifyEmailScreen from "./screens/VerifyEmailScreen.tsx";
import PlayListScreen from "./screens/PlayListScreen.tsx";
import SubscriptionsScreen from "./screens/SubscriptionsScreen.tsx";
import PlaylistsScreen from "./screens/PlaylistsScreen.tsx";
import UpdateUserProfile from "./components/UpdateUserProfile.tsx";
import ChannelContent from "./screens/ChannelContent.tsx";
import SearchScreen from "./screens/SearchScreen.tsx";

const router = createBrowserRouter([
  {
    path: "/register",
    element: <RegisterForm />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/forgot-password",
    element: <ForgetPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },
  {
    path: "/verify-email/:token",
    element: <EmailVerificationConfirmation />,
  },
  {
    path: "verify-email",
    element: <VerifyEmailScreen />,
  },
  {
    path: "/update-profile",
    element: <UpdateUserProfile />,
  },
  {
    path: "",
    element: <PrivateRoutes />,
    children: [
      {
        path: "/",
        element: <HomeScreen />,
      },
      {
        path: "/results",
        element: <SearchScreen />,
      },
      {
        path: "/subscriptions",
        element: <SubscriptionsScreen />,
      },
      {
        path: "/playlists",
        element: <PlaylistsScreen />,
      },
      {
        path: "user/:username",
        element: <Channel />,
      },
      {
        path: "your-videos",
        element: <ChannelContent />,
      },
      {
        path: "watch",
        element: <VideoPlayerScreen />,
      },
      {
        path: "history",
        element: <History />,
      },
      {
        path: "playlist",
        element: <PlayListScreen />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App>
        <RouterProvider router={router} />
      </App>
    </PersistGate>
  </Provider>
);
