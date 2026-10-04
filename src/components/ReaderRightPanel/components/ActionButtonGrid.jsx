import React from "react";
import ActionButton from "./ActionButton";
import styles from "../readerRightPanel.module.scss";

/** 2-column grid of ActionButtons for the active tab. */
const ActionButtonGrid = ({ actions, onSelectAction }) => {
  return (
    <div className={styles.actionGrid}>
      {actions.map((action) => (
        <ActionButton
          key={action.id}
          label={action.label}
          onClick={() => onSelectAction(action)}
        />
      ))}
    </div>
  );
};

export default ActionButtonGrid;
