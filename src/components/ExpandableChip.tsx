import React from "react";
import { Chip, Popover, Box, Typography } from "@mui/material";

interface MethodChipProps {
  name: string;
  filename: string;
  onRemove: () => void;
}

export function ExpandableChip({ name, filename, onRemove }: MethodChipProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Chip
        label={name.length > 35 ? name.slice(0, 33) + "..." : name}
        onClick={handleOpen}
        onDelete={onRemove}
        sx={{
          maxWidth: 220,
          overflow: "hidden"
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
      >
        <Box sx={{ p: 2, minWidth: 200, maxWidth: 400, display: "flex", flexDirection: "column", gap: 2 }}>

          <Typography variant="subtitle2">
            {filename}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              wordBreak: "break-word",
              fontFamily: "monospace"
            }}
          >
            {name}
          </Typography>

        </Box>
      </Popover>
    </>
  );
}