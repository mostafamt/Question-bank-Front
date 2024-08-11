import React from "react";

import styles from "./objectUI.module.scss";

const ObjectUI = (props) => {
  const { label, name, parseParameters, space, level } = props;

  return (
    <>
      <h5>{label}: </h5>
      <div className={styles.value}>
        {parseParameters(name, space, level + 1)}
      </div>
    </>
  );
};

export default ObjectUI;
