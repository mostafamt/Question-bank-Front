import React from "react";
import { Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../SmartObjectUpload/smartObjectForm.module.scss";

const SmartObjectLink = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = location.state?.title || "test";

  const handleSave = () => {};

  return (
    <div className={`${styles["smart-object-form"]} ${styles.link}`}>
      <fieldset>
        <legend>{title}</legend>
        <div className={styles.searchRow}>
          <label>
            Keyword
            <input placeholder="Enter keyword to search for" />
          </label>
          <label>
            Search web
            <select defaultValue="Youtube">
              <option>Youtube</option>
            </select>
          </label>
          <Button variant="contained" onClick={handleSave}>
            Search
          </Button>
        </div>
        <input className={styles.url} placeholder="paste link here" />
        <label>
          <input type="checkbox" defaultChecked />
          Do preprocessing
        </label>
        <label>
          <input type="checkbox" defaultChecked />
          Is interactive
        </label>
      </fieldset>
      <div className={styles.actions}>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SmartObjectLink;