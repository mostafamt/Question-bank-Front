import React from "react";
import clsx from "clsx";
import VirtualBlock from "./VirtualBlock/VirtualBlock";

import styles from "./virtualBlocks.module.scss";

const VirtualBlocks = (props) => {
  const {
    showVB,
    children,
    className,
    virtualBlocks,
    setVirtualBlocks,
    activePage,
    openModal,
    setModalName,
  } = props;

  const virtualBlocksRenders = [];

  for (const label in virtualBlocks) {
    virtualBlocksRenders.push(
      <VirtualBlock
        key={`${activePage} ${label}`}
        label={label}
        openModal={openModal}
        setModalName={setModalName}
        checkedObject={virtualBlocks[label]}
        setCheckedObject={(value) => {
          const newVirtualBlocks = { ...virtualBlocks };
          newVirtualBlocks[label] = value;
          setVirtualBlocks(newVirtualBlocks);
        }}
        showVB={showVB}
      />
    );
  }

  return (
    <div className={className}>
      {virtualBlocksRenders}
      {children}
    </div>
  );
};

export default VirtualBlocks;
