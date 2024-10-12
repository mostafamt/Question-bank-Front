import React from "react";
import QuillEditor from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from "./test.module.scss";
import { TextField } from "@mui/material";

const Test = () => {
  const [value, setValue] = React.useState("<p>Hello World</p>");

  return (
    <>
      <div className={styles.wrapper}>
        <label className={styles.label}>Editor Content</label>
        <QuillEditor
          className={styles.editor}
          theme="snow"
          value={value}
          onChange={(value) => setValue(value)}
        />
      </div>
      <p style={{ margin: "2rem" }}>{value}</p>
      <div className="ql-editor" dangerouslySetInnerHTML={{ __html: value }} />
      <TextField
        id="outlined-basic"
        label="Outlined"
        variant="outlined"
        value={value}
      />
    </>
  );
};

export default Test;
