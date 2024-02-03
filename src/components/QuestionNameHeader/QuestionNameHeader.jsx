import React from "react";
import styles from "./questionNameHeader.module.scss";

const QuestionNameHeader = (props) => {
  const { children } = props;
  return <div className={styles.header}>{children}</div>;
};

export default QuestionNameHeader;
