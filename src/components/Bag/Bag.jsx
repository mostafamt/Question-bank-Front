import React from "react";
import AddIcon from "@mui/icons-material/Add";
import styles from "./bag.module.scss";

/**
 * "My Bag" panel — persists across ReaderRightPanel tabs.
 * Real add/remove behavior (Phase 7 in ReaderRightPanel/README.md) is
 * pending confirmation of bag semantics; `onAdd` is a placeholder hook.
 */
const Bag = ({ items = [], onAdd }) => {
  return (
    <div className={styles.bag}>
      <span className={styles.bagLabel}>My Bag</span>
      <button
        type="button"
        className={styles.addButton}
        onClick={onAdd}
        aria-label="Add to bag"
      >
        <AddIcon fontSize="small" />
      </button>
    </div>
  );
};

export default Bag;
