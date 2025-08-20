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

import styles from "./studioCompositeBlocks.module.scss";

const StudioCompositeBlocks = (props) => {
  const {
    compositeBlocks,
    compositeBlocksTypes,
    onChangeCompositeBlocks,
    processCompositeBlock,
    onSubmitCompositeBlocks,
    loadingSubmitCompositeBlocks,
  } = props;

  const list1 = getList1FromData(compositeBlocksTypes);
  const list2 = getList2FromData(compositeBlocksTypes, compositeBlocks.type);

  const onChange = (id, type, value) => {
    const typeOfLabel = getTypeOfLabelForCompositeBlocks(
      compositeBlocksTypes,
      compositeBlocks.type,
      value
    );

    onChangeCompositeBlocks(id, type, value);
    onChangeCompositeBlocks(id, "text", typeOfLabel);

    processCompositeBlock(id, typeOfLabel);

    console.log("type= ", typeOfLabel);
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
      return <TextField size="small" defaultValue={block.text} />;
    } else {
      return <img src={block.img} alt={block.img} width="100%" />;
    }
  };

  return (
    <div className={styles["studio-composite-blocks"]}>
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
