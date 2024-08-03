import React from "react";
import MuiSelect from "../MuiSelect/MuiSelect";

import styles from "./areaActionHeader.module.scss";

const AreaActionHeader = (props) => {
  const {
    list,
    parameter,
    onChangeParameter,
    idx,
    onClickDeleteArea,
    trialArea,
  } = props;

  return (
    <div className={styles["area-action-header"]}>
      <div
        className={styles.color}
        style={{
          backgroundColor: trialArea.color || "green",
        }}
      ></div>
      <MuiSelect
        list={list}
        value={trialArea.parameter}
        onChange={(e) => onChangeParameter(e.target.value, idx)}
      />
    </div>
  );
};

export default AreaActionHeader;
