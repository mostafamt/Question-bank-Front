import React from "react";

import styles from "./validationMessage.module.scss";

const ValidationMessage = (props) => {
  const { path, errors } = props;

  let error = {};
  path.forEach((element, idx) => {
    error = idx === 0 ? errors?.[element] : error?.[element];
  });

  return error && <p className={styles["validation-message"]}>{error?.type}</p>;
};

export default ValidationMessage;
