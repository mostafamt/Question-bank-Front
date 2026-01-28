import React from "react";

import AreaActionResult from "../AreaActionResult/AreaActionResult";
import AreaActionHeader from "../AreaActionHeader/AreaActionHeader";
import { useStore } from "../../store/store";
import { grey } from "@mui/material/colors";
import { PlayArrow, Edit, DeleteForever } from "@mui/icons-material";
import AreaItem from "../AreaItem/AreaItem";

import styles from "./areaAction.module.scss";

const SIMPLE_ITEM = "Simple item";

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
    typeOfActiveType,
  } = props;

  const { openModal } = useStore();

  const handleToggle = () => updateAreaProperty(idx, { open: !area.open });

  const handlePlay = (id, event) => {
    event.stopPropagation();
    openModal("play-object", {
      workingArea: area,
    });
  };

  const handleEdit = (id, event) => {
    event.stopPropagation();

    openModal(area.type !== SIMPLE_ITEM ? "auto-ui" : "quill", {
      workingArea: area,
      updateAreaPropertyById: updateAreaPropertyById,
    });
  };

  const handleDelete = (id, event) => {
    event.stopPropagation();
    onClickDeleteArea(idx);
  };

  const actions = [
    area.type !== "Simple item" ? (
      {
        label: "play",
        icon: <PlayArrow sx={{ color: grey[700] }} />,
        onClick: handlePlay,
      }
    ) : (
      <div style={{ width: "3.25rem" }}></div>
    ),
    {
      label: "edit",
      icon: <Edit sx={{ color: grey[700] }} />,
      onClick: handleEdit,
    },
    {
      label: "delete",
      icon: <DeleteForever color="error" />,
      onClick: handleDelete,
    },
  ];

  return (
    <AreaItem
      actions={actions}
      color={area.color}
      title={area.label}
      handleToggle={handleToggle}
      isOpen={area.open}
      area={area}
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
        typeOfActiveType={typeOfActiveType}
      />
      <AreaActionResult onEditText={onEditText} trialArea={area} />
    </AreaItem>
  );
};

export default AreaAction;
