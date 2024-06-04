// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./app/store.ts";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import PrivateRoutes from "./components/PrivateRoutes";
import HomeScreen from "./screens/HomeScreen";
import VideoPlayerScreen from "./screens/VideoPlayerScreen";
import History from "./screens/History";
import Channel from "./screens/Channel";

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
    path: "",
    element: <PrivateRoutes />,
    children: [
      {
        path: "/",
        element: <HomeScreen />,
      },
      {
        path: "user/:username",
        element: <Channel />,
      },
      {
        path: "watch",
        element: <VideoPlayerScreen />,
      },
      {
        path: "history",
        element: <History />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App>
        <RouterProvider router={router} />
      </App>
    </Provider>
  </React.StrictMode>
);
