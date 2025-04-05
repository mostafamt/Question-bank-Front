import React from "react";

import { Box, Collapse, IconButton, List, TextField } from "@mui/material";
import { DeleteForever } from "@mui/icons-material";
import { useStore } from "../../store/store";
import AreaActionResult from "../AreaActionResult/AreaActionResult";
import AreaActionHeader from "../AreaActionHeader/AreaActionHeader";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { hexToRgbA } from "../../utils/helper";

import styles from "./areaAction.module.scss";

const AreaAction = (props) => {
  const {
    parameter,
    onChangeParameter,
    idx,
    onClickDeleteArea,
    onEditText,
    type,
    trialArea,
    updateTrialAreas,
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

  const onClick = () => {
    updateTrialAreas(idx, { open: !trialArea.open });
  };

  const onClickDelete = (event) => {
    event.stopPropagation();
    onClickDeleteArea(idx);
  };

  return (
    <div
      className={styles["area-action"]}
      style={{
        borderColor: hexToRgbA(trialArea.color),
      }}
    >
      <ListItemButton
        onClick={onClick}
        sx={{ padding: "0 0.5rem", background: hexToRgbA(trialArea.color) }}
      >
        <ListItemText primary={parameter} />
        <IconButton aria-label="delete" onClick={onClickDelete}>
          <DeleteForever color="error" />
        </IconButton>
        {trialArea.open ? <RemoveIcon /> : <AddIcon />}
      </ListItemButton>

      <Collapse in={trialArea.open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <Box
            sx={{
              // backgroundColor: "#eee",
              borderRadius: "3px",
              p: "1rem 0.5rem",
            }}
          >
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
          </Box>
        </List>
      </Collapse>
    </div>
  );
};

export default AreaAction;
