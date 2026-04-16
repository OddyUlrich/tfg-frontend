import React, { JSX } from "react";
import { useLocation } from "react-router-dom";
import { Box, Breadcrumbs, Typography } from "@mui/material";
import { Home } from "@mui/icons-material";
import { Link } from "./Link";

const breadcrumbNameMap: { [key: string]: { label: string, to?: string };} = {
  exercises: { label: "Exercises", to: "/"},
  new: { label: "New", to: "/"},
  about: { label: "About", to: "/about" },
};

interface MyBreadcrumbsProps {
  exerciseName?: string;
  batteryName?: string;
}

export function MyBreadcrumbs(props: MyBreadcrumbsProps) {
  let content: JSX.Element[];
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x && x !== "exercises");

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

  } else if (!props.batteryName && !props.exerciseName && pathnames.length > 0) {
    content = pathnames.map((value, index) => {
      const last = index === pathnames.length - 1;
      const to = breadcrumbNameMap[value]?.to ?? `/${pathnames.slice(0, index + 1).join("/")}`;
      const label = breadcrumbNameMap[value]?.label ?? value;

      return last ? (
        <Typography color="text.primary" key={to}>
          {label}
        </Typography>
      ) : (
        <Link underline="hover" color="inherit" to={to} key={to}>
          {label}
        </Link>
      );
    });

  }else{
    return null;
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
