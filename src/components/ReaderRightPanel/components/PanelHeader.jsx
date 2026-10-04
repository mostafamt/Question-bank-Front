import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import styles from "../readerRightPanel.module.scss";

/**
 * Header bar: shows the current tab title, or the active action's label
 * with a back arrow once an action is selected (the drilled-into content
 * itself is still a placeholder until Phase 3/6).
 */
const PanelHeader = ({ title, onBack }) => {
  return (
    <div className={styles.header}>
      {onBack && (
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowBackIcon fontSize="small" />
        </button>
      )}
      <span className={styles.headerTitle}>{title}</span>
    </div>
  );
};

export default PanelHeader;
