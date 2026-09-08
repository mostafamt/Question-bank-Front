import React from "react";
import styles from "../readerRightPanel.module.scss";

/** Single blue rounded action button in the grid. */
const ActionButton = ({ label, onClick }) => {
  return (
    <button type="button" className={styles.actionButton} onClick={onClick}>
      {label}
    </button>
  );
};

export default ActionButton;
