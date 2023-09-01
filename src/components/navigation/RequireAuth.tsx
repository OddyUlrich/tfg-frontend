import React, { FC, useContext } from "react";
import { LoginContext } from "../../Utils";
import { LoginTypes } from "../../Types";
import { Navigate } from "react-router-dom";

export const RequireAuth: FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const loginStatus: LoginTypes = useContext(LoginContext);

  if (!loginStatus.isLogged) {
    return <Navigate to="/login" replace={true} />;
  }
  return children;
};
