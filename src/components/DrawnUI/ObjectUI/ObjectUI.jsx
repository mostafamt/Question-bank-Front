import React from "react";

import styles from "./objectUI.module.scss";

const ObjectUI = (props) => {
  console.log("objectuI");
  const { label, value, parseParameters, space, level } = props;

  return (
    <>
      <h5>{label}: </h5>
      <div className={styles.value}>
        {parseParameters(value, space, level + 1)}
      </div>
    </>
  );
};

export default ObjectUI;
