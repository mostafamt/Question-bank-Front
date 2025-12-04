import React from "react";
import { parseVirtualBlocksFromPages } from "../../../utils/virtual-blocks";
import { TIMEOUTS } from "../constants";

const useVirtualBlocks = ({
  virtualBlocks,
  setVirtualBlocks,
  pages,
  subObject = false,
  recalculateAreas,
}) => {
  const [showVB, setShowVB] = React.useState(false);

  const onClickToggleVirutalBlocks = () => {
    setShowVB((prevState) => !prevState);
    setTimeout(() => {
      recalculateAreas();
    }, TIMEOUTS.VIRTUAL_BLOCKS_TOGGLE_DELAY);
  };

  return {
    showVB,
    setShowVB,
    onClickToggleVirutalBlocks,
  };
};

export default useVirtualBlocks;
