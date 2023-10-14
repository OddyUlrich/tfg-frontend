import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="centered-mt notFound-mt">
      <div>
        <Typography className="flex-center" variant="h2">
          Error 404
        </Typography>
        <Typography marginTop="10%" variant="h6">
          Looks like you're lost
        </Typography>

        <Typography marginTop="2%" variant="body1">
          The page you are looking for is not available!
        </Typography>

        <Box className="flex-center" marginTop="50px">
          <Button component={Link} to="/">
            Go Home
          </Button>
        </Box>
      </div>
    </div>
  );
}
