import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Typography } from "@mui/material";

const breadcrumbNameMap: { [key: string]: string } = {
  "/about": "About",
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Breadcrumbs>
      <Link color="inherit" to="/">
        Home
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;

        return last ? (
          <Typography color="text.primary" key={to}>
            {breadcrumbNameMap[to]}
          </Typography>
        ) : (
          <Link color="inherit" to={to} key={to}>
            {breadcrumbNameMap[to]}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
