import React from "react";
import { Box, TextField } from "@mui/material";

import styles from "./text.module.scss";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";
import { Controller } from "react-hook-form";
import { fullTextTrim } from "../../../utils/data";

const Text = (props) => {
  const { space, label, name, errors, type, path, required, control, initialColor } = props;

  const newLabel = fullTextTrim(label);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [areaColor, setAreaColor] = React.useState(initialColor ?? null);

  return (
    <Box
      className={styles.text}
      sx={{
        borderLeft: areaColor ? `6px solid ${areaColor}` : undefined,
        borderRadius: areaColor ? "4px 0 0 4px" : undefined,
        pl: areaColor ? 1 : undefined,
        transition: "border-left 0.2s ease",
      }}
    >
      <Controller
        name={name}
        control={control}
        rules={{ required }}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label={newLabel}
            type={type}
            fullWidth
            inputProps={{
              onDragOver: (e) => {
                e.preventDefault();
                setIsDragOver(true);
              },
              onDragLeave: () => setIsDragOver(false),
              onDrop: (e) => {
                e.preventDefault();
                setIsDragOver(false);
                const text = e.dataTransfer.getData("text/plain");
                const color = e.dataTransfer.getData("application/x-area-color");
                if (text) field.onChange(text);
                setAreaColor(color || null);
              },
            }}
            sx={{
              borderRadius: 1,
              outline: isDragOver ? "2px dashed #1976d2" : "none",
              ...(areaColor && {
                "& .MuiOutlinedInput-root": {
                  backgroundColor: `${areaColor}18`,
                },
              }),
            }}
          />
        )}
      />
      <ValidationMessage path={path} errors={errors} />
    </Box>
  );
};

export default Text;
