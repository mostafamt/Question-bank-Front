import React from "react";

import styles from "./areaAction.module.scss";
import MuiSelect from "../MuiSelect/MuiSelect";
import { IconButton, TextField } from "@mui/material";
import { DeleteForever } from "@mui/icons-material";

import { useStore } from "../../store/store";

const AreaAction = (props) => {
  const {
    color,
    parameter,
    onChangeParameter,
    idx,
    onClickDeleteArea,
    extractedTextList,
    onEditText,
    type,
  } = props;

  const { data: state } = useStore();

  const [list, setList] = React.useState([]);
  const [types, setTypes] = React.useState({});

  const getLabels = React.useCallback(() => {
    // GET LABELS OF THE SELECTED TYPE
    let labels = state?.types.find((item) => item.typeName === type)?.labels;

    if (!labels) {
      labels = state?.oldTypes.find((item) => item.typeName === type)?.labels;
    }

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
    <>
      <div className={styles.row}>
        <div
          className={styles.color}
          style={{
            backgroundColor: color ? color : "green",
          }}
        ></div>
        <MuiSelect
          list={list}
          value={parameter}
          color={color}
          onChange={(e) => onChangeParameter(e.target.value, idx)}
        />
        <IconButton aria-label="delete" onClick={() => onClickDeleteArea(idx)}>
          <DeleteForever color="error" />
        </IconButton>
      </div>

      <div>
        {types[parameter] === "text" ? (
          extractedTextList?.[idx] ? (
            <TextField
              sx={{
                width: "100%",
                mt: 1,
              }}
              label=""
              variant="outlined"
              type="text"
              multiline
              value={extractedTextList?.[idx]?.text}
              onChange={(e) =>
                onEditText(extractedTextList[idx]?.id, e.target.value)
              }
            />
          ) : (
            <></>
          )
        ) : extractedTextList?.[idx] ? (
          <img
            src={extractedTextList?.[idx]?.image}
            alt="image1"
            style={{
              width: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default AreaAction;
