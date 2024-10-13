import React from "react";

import { Box, Collapse, IconButton, List, TextField } from "@mui/material";
import { DeleteForever } from "@mui/icons-material";
import AreaActionResult from "../AreaActionResult/AreaActionResult";
import AreaActionHeader from "../AreaActionHeader/AreaActionHeader";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { hexToRgbA } from "../../utils/helper";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import styles from "./areaAction.module.scss";
import { grey } from "@mui/material/colors";
import { isComplexType } from "../../utils/ocr";

const AreaAction = (props) => {
  const {
    parameter,
    idx,
    onClickDeleteArea,
    onEditText,
    type,
    area,
    updateAreaProperty,
    updateAreaPropertyById,
    types,
    onChangeLabel,
    subObject,
    setModalName,
    openModal,
    setWorkingArea,
  } = props;

  const onClick = () => {
    updateAreaProperty(idx, { open: !area.open });
  };

  const onClickDelete = (event) => {
    event.stopPropagation();
    onClickDeleteArea(idx);
  };

  const onClickEdit = (event) => {
    event.stopPropagation();
    console.log("area.type= ", area);
    if (isComplexType(area.label)) {
      setModalName("auto-ui");
    } else {
      setModalName("quill");
    }
    setWorkingArea(area);

    openModal();
  };

  const onClickPlay = (event) => {
    event.stopPropagation();
    setModalName("play-object");
    setWorkingArea(area);
    openModal();
  };

  return (
    <div
      className={styles["area-action"]}
      style={{
        borderColor: hexToRgbA(area.color),
      }}
    >
      <ListItemButton
        onClick={onClick}
        sx={{
          padding: "0 0.5rem",
          background: hexToRgbA(area.color),
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <ListItemText primary={area.label} />

          {area.open ? <RemoveIcon /> : <AddIcon />}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            // padding: "1rem",
            width: "100%",
          }}
        >
          {area.isServer && isComplexType(area.label) ? (
            <IconButton aria-label="edit" onClick={onClickPlay}>
              <PlayArrowIcon sx={{ color: grey[700] }} />
            </IconButton>
          ) : (
            <div style={{ width: "3.25rem" }}></div>
          )}
          <IconButton aria-label="edit" onClick={onClickEdit}>
            <EditIcon sx={{ color: grey[700] }} />
          </IconButton>
          <IconButton aria-label="delete" onClick={onClickDelete}>
            <DeleteForever color="error" />
          </IconButton>
        </div>
      </ListItemButton>

      <Collapse in={area.open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <Box
            sx={{
              // backgroundColor: "#eee",
              borderRadius: "3px",
              p: "1rem 0.5rem",
            }}
          >
            <AreaActionHeader
              parameter={parameter}
              idx={idx}
              onClickDeleteArea={onClickDeleteArea}
              trialArea={area}
              types={types}
              onChangeLabel={onChangeLabel}
              subObject={subObject}
              type={type}
              updateAreaProperty={updateAreaProperty}
              updateAreaPropertyById={updateAreaPropertyById}
            />

            <AreaActionResult onEditText={onEditText} trialArea={area} />
          </Box>
        </List>
      </Collapse>
    </div>
  );
};

export default AreaAction;
