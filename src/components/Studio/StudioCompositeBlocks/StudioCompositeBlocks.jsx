import React from "react";
import MuiSelect from "../../MuiSelect/MuiSelect";
import { Box } from "@mui/material";

import styles from "./studioCompositeBlocks.module.scss";

const StudioCompositeBlocks = (props) => {
  const {
    compositeBlocksAreas,
    compositeBlocksTypes,
    onChangeCompositeBlocksList,
  } = props;

  const list = compositeBlocksTypes?.labels?.map((item) => item.typeName);

  const getChildSelectMenu = (type) => {
    compositeBlocksTypes?.labels?.find((item) => item.typeName);
  };

  return (
    <div>
      {compositeBlocksAreas.map((block) => (
        <Box
          key={block.id}
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <MuiSelect
            value={block.type}
            onChange={(e) =>
              onChangeCompositeBlocksList(block.id, e.target.value)
            }
            list={list}
          />
          <MuiSelect value={""} onChange={(e) => {}} list={[]} />
        </Box>
      ))}
    </div>
  );
};

export default StudioCompositeBlocks;
