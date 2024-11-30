import { useAppSelector } from "@/app/hooks";
import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = () => {
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (!user?.isEmailVerified) {
    return <Navigate to="/verify-email" />;
  }

  if (user?.isEmailVerified && user?.userName.startsWith("user_")) {
    return <Navigate to="/update-profile" />;
  }

  return <Outlet />;
};

export default PrivateRoutes;
