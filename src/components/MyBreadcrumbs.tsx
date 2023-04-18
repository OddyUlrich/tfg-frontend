import React from "react";
import { useLocation } from "react-router-dom";
import { Box, Breadcrumbs, Typography } from "@mui/material";
import { Home } from "@mui/icons-material";
import { Link } from "../Utils";

const breadcrumbNameMap: { [key: string]: string } = {
  "/about": "About",
  "/exercises": "",
};

interface MyBreadcrumbsProps {
  exerciseName?: string;
  batteryName?: string;
}

export function MyBreadcrumbs(props: MyBreadcrumbsProps) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Box sx={{ marginLeft: "25px", marginTop: "15px" }}>
      <Breadcrumbs separator="›" aria-label="breadcrumb">
        <Link
          sx={{ display: "flex", alignItems: "center" }}
          underline="hover"
          color="inherit"
          to="/"
        >
          <Home sx={{ mr: 0.5, mb: 0.5 }} color="primary" fontSize="medium" />
          Home
        </Link>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;

          if (to.match("/exercises$")) {
            return null;
          }
          if (to.includes("exercises") && !last) {
            const link = decodeURI(to.slice(to.lastIndexOf("/") + 1));
            const newTo = "/#" + link.split(" ").join("-");

            return (
              <Link
                underline="hover"
                color="inherit"
                to={newTo}
                key={to}
                smooth
              >
                {link}
              </Link>
            );
          } else if (to.includes("exercises") && last) {
            return (
              <Typography color="text.primary" key={to}>
                {decodeURI(to.slice(to.lastIndexOf("/") + 1))}
              </Typography>
            );
          }

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
