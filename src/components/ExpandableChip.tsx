import React from "react";
import { Chip, Popover, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type MethodChipProps = {
  name: string;
  onRemove: () => void;
};

export function ExpandableChip({ name, onRemove }: MethodChipProps) {
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
        <Box sx={{ p: 2, width: 200, maxWidth: 400 }}>
          <Typography variant="subtitle2" gutterBottom>
            Método
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

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Popover>
    </>
  );
}