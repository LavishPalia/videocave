import { useAppSelector } from "@/app/hooks";
import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = () => {
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
