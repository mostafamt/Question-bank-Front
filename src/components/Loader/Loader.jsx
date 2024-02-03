import React from "react";

import styles from "./loader.module.scss";

const Loader = (props) => {
  return (
    <div className={styles.loader}>
      <span></span>
      <span>{props.text}</span>
    </div>
  );
};

export default Loader;
