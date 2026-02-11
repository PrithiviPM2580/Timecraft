import { useStore } from "@/store/store";
import { Navigate, Outlet } from "react-router-dom";
import { PROTECTED_ROUTES } from "./common/route-paths";

const AuthRoute = () => {
  const { user, accessToken } = useStore();

  if (!user || !accessToken) return <Outlet />;

  return <Navigate to={PROTECTED_ROUTES.EVENT_TYPES} replace />;
};

export default AuthRoute;
