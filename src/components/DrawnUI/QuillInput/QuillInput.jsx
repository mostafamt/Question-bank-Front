import React from "react";
import { Box, TextField } from "@mui/material";
import { Controller } from "react-hook-form";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import styles from "./quillInput.module.scss";
import { fullTextTrim } from "../../../utils/data";

const QuillInput = (props) => {
  const { space, label, name, errors, type, path, required, control } = props;

  // Toolbar options including color pickers
  const modules = {
    toolbar: [
      [{ size: [] }], // 👈 font size picker
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }], // 👈 color pickers here
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <Box className={styles["quill-input"]}>
      <Controller
        name={name}
        control={control}
        rules={{ required }}
        defaultValue="" // Set default value if needed
        render={({ field }) => (
          <ReactQuill
            theme="snow"
            modules={modules}
            className={styles.quill}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder="Write something awesome..."
          />
        )}
      />
    </Box>
  );
};

export default QuillInput;
