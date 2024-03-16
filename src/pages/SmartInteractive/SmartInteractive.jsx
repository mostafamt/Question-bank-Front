import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import EnhancedTable from "../../components/EnhancedTable/EnhancedTable";

import styles from "./smartInteractive.module.scss";
import { Button } from "@mui/material";

const SmartInteractive = () => {
  const [value, setValue] = React.useState("");

  return (
    <div className="container">
      <div className={styles.si}>
        <div className={styles.library}>
          <h4>Choose From Library:</h4>
          <EnhancedTable />
        </div>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={setValue}
          className={styles.quill}
        />
      </div>
      {/* <Button variant="contained">submit</Button> */}
    </div>
  );
};

export default SmartInteractive;
