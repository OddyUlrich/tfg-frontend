import React from "react";
import { useLocation } from "react-router-dom";
import { Box, Breadcrumbs, Typography } from "@mui/material";
import { Home } from "@mui/icons-material";
import { Link } from "./Link";

const breadcrumbNameMap: { [key: string]: string } = {
  "/about": "About",
  "/exercises": "",
};

interface MyBreadcrumbsProps {
  exerciseName?: string;
  batteryName?: string;
}

export function MyBreadcrumbs(props: MyBreadcrumbsProps) {
  let content: JSX.Element[];
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (props.exerciseName && props.batteryName) {
    const batterySection = props.batteryName.split(" ").join("-");
    const linkSection = "/#" + batterySection;

    content = [
      <Link
        underline="hover"
        color="inherit"
        to={linkSection}
        key={batterySection}
        smooth
      >
        {props.batteryName}
      </Link>,
      <Typography color="text.primary" key={props.exerciseName}>
        {props.exerciseName}
      </Typography>,
    ];
  } else {
    content = pathnames.map((value, index) => {
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
    });
  }

  return (
    <Box sx={{ marginLeft: "25px", marginTop: "10px" }}>
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
        {content}
      </Breadcrumbs>
    </Box>
  );
}
