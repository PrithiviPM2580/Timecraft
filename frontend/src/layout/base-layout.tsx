import { Outlet } from "react-router-dom";

const BaseLayout = () => {
  return (
    <div className="base-layout">
      <h1>Base Layout</h1>
      <Outlet />
    </div>
  );
};

export default BaseLayout;
