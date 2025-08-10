import React from "react";
import MuiSelect from "../../MuiSelect/MuiSelect";
import { Box, TextField } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { getList1FromData, getList2FromData } from "../../../utils/studio";

import styles from "./studioCompositeBlocks.module.scss";

const StudioCompositeBlocks = (props) => {
  const { compositeBlocks, compositeBlocksTypes, onChangeCompositeBlocks } =
    props;

  const list1 = getList1FromData(compositeBlocksTypes);
  const list2 = getList2FromData(compositeBlocksTypes, compositeBlocks.type);

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
              onChange={(e) =>
                onChangeCompositeBlocks(block.id, "type", e.target.value)
              }
              list={["", ...list2]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudioCompositeBlocks;
