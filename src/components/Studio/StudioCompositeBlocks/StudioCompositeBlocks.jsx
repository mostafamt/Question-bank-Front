import React from "react";
import MuiSelect from "../../MuiSelect/MuiSelect";
import { CircularProgress, TextField, Button, IconButton } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import {
  getList1FromData,
  getList2FromData,
  getTypeOfLabelForCompositeBlocks,
} from "../../../utils/studio";
import { colors } from "../../../constants/highlight-color";

import { grey } from "@mui/material/colors";
import { PlayArrow, Edit, DeleteForever, BackHand } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";

import styles from "./studioCompositeBlocks.module.scss";
import AreaItem from "../../AreaItem/AreaItem";
import { useStore } from "../../../store/store";

// large | medium | small
const iconFontSize = "small";

const StudioCompositeBlocks = (props) => {
  const {
    compositeBlocks,
    compositeBlocksTypes,
    onChangeCompositeBlocks,
    processCompositeBlock,
    onSubmitCompositeBlocks,
    loadingSubmitCompositeBlocks,
    DeleteCompositeBlocks,
    highlight,
    setHighlight,
    onClickHand,
  } = props;

  const { openModal } = useStore();

  const list1 = getList1FromData(compositeBlocksTypes);
  const list2 = getList2FromData(compositeBlocksTypes, compositeBlocks.type);

  const onChange = (id, type, value) => {
    const typeOfLabel = getTypeOfLabelForCompositeBlocks(
      compositeBlocksTypes,
      compositeBlocks.type,
      value
    );

    // Assign a random color from the palette when the user picks a type
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onChangeCompositeBlocks(id, type, value);
    onChangeCompositeBlocks(id, "color", randomColor);

    if (typeOfLabel === "Object" || typeOfLabel === "QObject" || typeOfLabel === "XObject") {
      return;
    }

    processCompositeBlock(id, typeOfLabel);
  };

  const handleToggle = (id, isOpen) => {
    onChangeCompositeBlocks(id, "open", !isOpen);
  };

  const onClickPlay = (id, event) => {
    openModal("play-composite-blocks", {
      id,
    });
  };

  const onClickEdit = (id, event) => {
    openModal("edit-composite-blocks", {
      id,
    });
  };

  const onClickDelete = (id, event) => {
    DeleteCompositeBlocks(id);
  };

  const renderBlockResult = (block) => {
    if (block.loading) {
      return (
        <div style={{ paddingTop: "0.5rem" }}>
          <CircularProgress size="1rem" />
        </div>
      );
    }

    if (block.text) {
      return (
        <TextField
          size="small"
          value={block.text}
          sx={{ mt: 1 }}
          multiline
          fullWidth
          onChange={(e) => {
            const newText = e.target.value;

            // update compositeBlocksState
            onChangeCompositeBlocks(block.id, "text", newText);
          }}
        />
      );
    } else {
      return <img src={block.img} alt={block.img} width="100%" />;
    }
  };

  const actions = [
    {
      label: "play",
      icon: <PlayArrow sx={{ color: grey[700] }} />,
      onClick: onClickPlay,
    },
    {
      label: "edit",
      icon: <Edit sx={{ color: grey[700] }} />,
      onClick: onClickEdit,
    },
    {
      label: "delete",
      icon: <DeleteForever color="error" />,
      onClick: onClickDelete,
    },
  ];

  return (
    <div className={styles["studio-composite-blocks"]}>
      <div>
        <Tooltip title="Pick an object">
          <IconButton
            aria-label="hand"
            onClick={onClickHand}
            sx={{
              backgroundColor: highlight === "hand" ? "#ccc" : "transparent",
            }}
          >
            <BackHand fontSize={iconFontSize} />
          </IconButton>
        </Tooltip>
      </div>
      <div className={styles.header}>
        <TextField
          label="Name"
          size="small"
          value={compositeBlocks.name}
          onChange={(e) =>
            onChangeCompositeBlocks(null, "name", e.target.value)
          }
        />

        <FormControl fullWidth>
          <InputLabel size="small" id="demo-simple-select-label">
            Type
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            size="small"
            id="demo-simple-select"
            label="Type"
            value={compositeBlocks.type}
            onChange={(e) =>
              onChangeCompositeBlocks(null, "type", e.target.value)
            }
          >
            <MenuItem value="">
              <em>Select Type</em>
            </MenuItem>
            {list1?.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className={styles.blocks}>
        {compositeBlocks?.areas?.map((block) => (
          <AreaItem
            id={block.id}
            isOpen={block.open}
            title={compositeBlocks.type}
            actions={actions}
            handleToggle={() => handleToggle(block.id, block.open)}
            color={block.color}
          >
            <div key={block.id} className={styles.block}>
              <MuiSelect
                value={block.type}
                onChange={(e) => onChange(block.id, "type", e.target.value)}
                list={["", ...list2]}
              />
              {renderBlockResult(block)}
            </div>
          </AreaItem>
        ))}
      </div>

      <div className={styles.submit}>
        <Button
          variant="contained"
          sx={{ width: "100%", margin: "1rem 0" }}
          disabled={
            compositeBlocks.areas.length === 0 || loadingSubmitCompositeBlocks
          }
          startIcon={
            loadingSubmitCompositeBlocks ? (
              <CircularProgress size="1rem" />
            ) : (
              <></>
            )
          }
          onClick={onSubmitCompositeBlocks}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default StudioCompositeBlocks;
