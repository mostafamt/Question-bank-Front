import React from "react";
import "react-quill/dist/quill.snow.css";
/** @jsxImportSource @emotion/react */

import styles from "./test.module.scss";

const Test = () => {
  return (
    <>
      <br />
      <br />
      <div>
        <button
          className={styles["hover-element"]}
          css={{
            "&::before": {
              content: '"Before from jsx - "',
            },
          }}
        >
          Hover Me
        </button>
      </div>
    </>
  );
};

export default Test;
