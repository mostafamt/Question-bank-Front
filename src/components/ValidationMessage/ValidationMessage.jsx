import React from "react";

import styles from "./validationMessage.module.scss";

const ValidationMessage = (props) => {
  const { path, errors } = props;

  // console.log('path ')

  let error = {};
  path.forEach((element, idx) => {
    error = idx === 0 ? errors?.[element] : error?.[element];
  });

  const message = error?.message || error?.root?.message;

  return error && <p className={styles["validation-message"]}>{message}</p>;
};

export default ValidationMessage;
