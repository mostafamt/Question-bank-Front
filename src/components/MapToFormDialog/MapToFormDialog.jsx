import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

const MapToFormDialog = ({ open, onClose, json, onConfirm }) => {
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open && json !== null) {
      setText(JSON.stringify(json, null, 2));
      setError("");
    }
  }, [open, json]);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    try {
      JSON.parse(value);
      setError("");
    } catch {
      setError("Invalid JSON");
    }
  };

  const handleConfirm = () => {
    try {
      const parsed = JSON.parse(text);
      onConfirm(parsed);
    } catch {
      setError("Invalid JSON");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Map to Form — JSON Preview</DialogTitle>
      <DialogContent>
        <TextField
          multiline
          fullWidth
          minRows={10}
          value={text}
          onChange={handleChange}
          inputProps={{ style: { fontFamily: "monospace", fontSize: 13 } }}
          sx={{ mt: 1 }}
        />
        {error && (
          <Typography color="error" variant="caption" sx={{ mt: 0.5, display: "block" }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!!error}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MapToFormDialog;
