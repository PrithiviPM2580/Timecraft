import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  authenticattionRoutePaths,
  protectedRoutePaths,
  publicRoutePaths,
} from "./common/routes";
import AuthRoute from "./auth-route";
import ProtectedRoute from "./protected-route";
import AppLayout from "@/layout/app-layout";
import BaseLayout from "@/layout/base-layout";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthRoute />}>
          <Route element={<BaseLayout />}>
            {authenticattionRoutePaths.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Route>

        <Route path="/" element={<BaseLayout />}>
          {publicRoutePaths.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {protectedRoutePaths.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
