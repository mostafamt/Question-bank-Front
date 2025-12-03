import React from "react";

const useStudioActions = ({ getBlockFromBlockId }) => {
  const [highlight, setHighlight] = React.useState("");
  const [highlightedBlockId, setHighlightedBlockId] = React.useState(null);
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);

  const hightBlock = (id) => {
    if (!id) return;

    // 1) Find the block (we already have getBlockFromBlockId)
    const block = getBlockFromBlockId(id);
    if (!block) return;

    setHighlightedBlockId(id);
  };

  return { highlight, setHighlight, highlightedBlockId, hightBlock };
};

export default useStudioActions;
