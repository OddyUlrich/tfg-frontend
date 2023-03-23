import React from "react";
import { Link as ReactLink, useLocation } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Link as LinkMUI,
  LinkProps,
  Typography,
} from "@mui/material";

const breadcrumbNameMap: { [key: string]: string } = {
  "/about": "About",
};

interface LinkRouterProps extends LinkProps {
  to: string;
  replace?: boolean;
}

function Link(props: LinkRouterProps) {
  return <LinkMUI {...props} component={ReactLink} />;
}

export function MyBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Box sx={{ marginLeft: "25px", marginTop: "15px" }}>
      <Breadcrumbs separator="›" aria-label="breadcrumb">
        <Link underline="hover" color="inherit" to="/">
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
            <Link underline="hover" color="inherit" to={to} key={to}>
              {breadcrumbNameMap[to]}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
