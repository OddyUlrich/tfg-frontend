import React, { FC, useContext } from "react";
import { LoginContext } from "../../Utils";
import { LoginTypes } from "../../Types";
import { Navigate } from "react-router-dom";

export const AlreadyAuth: FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const loginStatus: LoginTypes = useContext(LoginContext);

  //If the user is already logged in their account we move them to the homepage "/" and modify their internal browsing
  //history with replace={true} preventing them from returning to the login or registration page with the back button
  if (loginStatus.isLogged) {
    return <Navigate to="/" replace={true} />;
  }
  return children;
};
