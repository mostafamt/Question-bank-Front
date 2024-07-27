import React from "react";

import styles from "./areaAction.module.scss";
import MuiSelect from "../MuiSelect/MuiSelect";
import { Collapse, IconButton, List, TextField } from "@mui/material";
import { DeleteForever } from "@mui/icons-material";

import { useStore } from "../../store/store";
import AreaActionResult from "../AreaActionResult/AreaActionResult";
import AreaActionHeader from "../AreaActionHeader/AreaActionHeader";

const AreaAction = (props) => {
  const {
    parameter,
    onChangeParameter,
    idx,
    onClickDeleteArea,
    onEditText,
    type,
    trialArea,
  } = props;

  const { data: state } = useStore();

  const [list, setList] = React.useState([]);
  const [types, setTypes] = React.useState({});

  const getLabels = React.useCallback(() => {
    // GET LABELS OF THE SELECTED TYPE
    let labels = state?.types.find((item) => item.typeName === type)?.labels;

    // getTypeOfParameter

    const object = labels?.reduce((acc, item) => {
      const key = Object.keys(item)?.[0];
      return { ...acc, [key]: item[key] };
    }, {});
    setTypes(object);
    const params = labels?.map((item) => Object.keys(item)?.[0]);
    setList(params);
  }, [type, state.types]);

  React.useEffect(() => {
    getLabels();
  }, [getLabels]);

  return (
    <div className={styles["area-action"]}>
      <AreaActionHeader
        list={list}
        parameter={parameter}
        onChangeParameter={onChangeParameter}
        idx={idx}
        onClickDeleteArea={onClickDeleteArea}
        trialArea={trialArea}
      />

      <AreaActionResult
        type={types[parameter]}
        onEditText={onEditText}
        trialArea={trialArea}
      />
    </div>
  );
};

export default AreaAction;
