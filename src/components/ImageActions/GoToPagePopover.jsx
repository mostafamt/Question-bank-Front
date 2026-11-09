import React from "react";
import { Box, Button, Popover, TextField } from "@mui/material";

/**
 * Small "go to page" box opened from the toolbar's page indicator below
 * desktop, where the first/last buttons are hidden or cramped.
 *
 * @param {Object} props
 * @param {HTMLElement|null} props.anchorEl - Page indicator button; null = closed
 * @param {Function} props.onClose
 * @param {number} props.currentPage - 1-based
 * @param {number} props.pageCount
 * @param {Function} props.onGoToPage - Called with the 0-based page index
 */
const GoToPagePopover = ({
  anchorEl,
  onClose,
  currentPage,
  pageCount,
  onGoToPage,
}) => {
  const [value, setValue] = React.useState(String(currentPage));
  const open = Boolean(anchorEl);

  // Start from the current page every time the box opens
  React.useEffect(() => {
    if (open) setValue(String(currentPage));
  }, [open, currentPage]);

  const page = Number(value);
  const isValid = Number.isInteger(page) && page >= 1 && page <= pageCount;

  const onSubmit = (event) => {
    event.preventDefault();
    if (!isValid) return;
    onClose();
    if (page !== currentPage) onGoToPage(page - 1);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{ display: "flex", alignItems: "flex-start", gap: 1, p: 1.5 }}
      >
        <TextField
          autoFocus
          size="small"
          type="number"
          label="Go to page"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          error={value !== "" && !isValid}
          helperText={`1–${pageCount}`}
          inputProps={{ min: 1, max: pageCount, inputMode: "numeric" }}
          sx={{ width: "8rem" }}
        />
        <Button type="submit" variant="contained" disabled={!isValid}>
          Go
        </Button>
      </Box>
    </Popover>
  );
};

export default GoToPagePopover;
