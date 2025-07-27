import React from "react";

import styles from "./test2.module.scss";

const Test2 = () => {
  return (
    <div className={styles["test-2"]}>
      <div className={styles.header}>HEADER</div>
      <div className={styles["main-content"]}>MAIN CONTENT</div>
      <div className={styles.footer}>FOOTER</div>
    </div>
  );
};

export default Test2;
