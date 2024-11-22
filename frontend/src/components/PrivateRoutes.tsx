import { useAppSelector } from "@/app/hooks";
import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = () => {
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (isLoggedIn && !user.isEmailVerified) {
    return <Navigate to="/verify-email" />;
  }

  return <Outlet />;
};

export default PrivateRoutes;
