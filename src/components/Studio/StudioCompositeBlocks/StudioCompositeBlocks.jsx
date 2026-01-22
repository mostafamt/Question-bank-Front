import React from "react";
import MuiSelect from "../../MuiSelect/MuiSelect";
import { CircularProgress, TextField, Button } from "@mui/material";
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

  // Track color index for sequential color assignment
  const [compositeColorIndex, setCompositeColorIndex] = React.useState(0);

  const list1 = getList1FromData(compositeBlocksTypes);
  const list2 = getList2FromData(compositeBlocksTypes, compositeBlocks.type);

  const onChange = (id, type, value) => {
    const typeOfLabel = getTypeOfLabelForCompositeBlocks(
      compositeBlocksTypes,
      compositeBlocks.type,
      value
    );

    // Get next color from palette using modulo for cycling
    const nextColor = colors[compositeColorIndex % colors.length];

    onChangeCompositeBlocks(id, type, value);
    // onChangeCompositeBlocks(id, "text", typeOfLabel);
    onChangeCompositeBlocks(id, "color", nextColor);

    // Increment color index for next assignment
    setCompositeColorIndex((prev) => prev + 1);

    if (typeOfLabel === "Object" || typeOfLabel === "QObject") {
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
            label="type"
            value={compositeBlocks.type}
            onChange={(e) =>
              onChangeCompositeBlocks(null, "type", e.target.value)
            }
          >
            {list1.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className={styles.blocks}>
        {compositeBlocks?.areas?.map((block) => (
          <div key={block.id} className={styles.block}>
            <MuiSelect
              value={block.type}
              onChange={(e) => onChange(block.id, "type", e.target.value)}
              list={["", ...list2]}
            />
            {renderBlockResult(block)}
          </div>
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
