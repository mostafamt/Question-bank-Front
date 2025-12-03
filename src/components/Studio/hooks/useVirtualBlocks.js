import React from "react";
import { parseVirtualBlocksFromPages } from "../../../utils/virtual-blocks";
import { TIMEOUTS } from "../constants";

const useVirtualBlocks = ({ pages, subObject = false, recalculateAreas }) => {
  const [virtualBlocks, setVirtualBlocks] = React.useState(
    subObject ? [] : parseVirtualBlocksFromPages(pages)
  );
  const [showVB, setShowVB] = React.useState(false);

  const onClickToggleVirutalBlocks = () => {
    setShowVB((prevState) => !prevState);
    setTimeout(() => {
      recalculateAreas();
    }, TIMEOUTS.VIRTUAL_BLOCKS_TOGGLE_DELAY);
  };

  return {
    virtualBlocks,
    setVirtualBlocks,
    showVB,
    setShowVB,
    onClickToggleVirutalBlocks,
  };
};

export default useVirtualBlocks;
