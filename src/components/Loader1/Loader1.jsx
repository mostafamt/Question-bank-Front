import React from "react";

import styles from "./loader.module.scss";

const Loader1 = () => {
  return (
    <div className={styles["loader-box"]}>
      <div className={styles.loader}></div>
    </div>
  );
};

export default Loader1;
