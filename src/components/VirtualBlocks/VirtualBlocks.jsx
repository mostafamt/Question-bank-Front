import React, { useCallback, useRef, useMemo } from "react";
import clsx from "clsx";
import VirtualBlock from "./VirtualBlock/VirtualBlock";

import styles from "./virtualBlocks.module.scss";

const VirtualBlocks = React.memo((props) => {
  const {
    showVB,
    children,
    className,
    virtualBlocks,
    setVirtualBlocks,
    activePage,
    reader = false,
    pageImageUrl,
  } = props;

  // Cache setCheckedObject callbacks to prevent recreating on every render
  const callbacksRef = useRef({});

  // Create stable callback getter - only recreates when setVirtualBlocks changes
  const getSetCheckedObject = useCallback(
    (label) => {
      if (!callbacksRef.current[label]) {
        callbacksRef.current[label] = (value) => {
          setVirtualBlocks((prev) => ({
            ...prev,
            [label]: value,
          }));
        };
      }
      return callbacksRef.current[label];
    },
    [setVirtualBlocks]
  );

  // Clear stale callbacks when activePage changes
  React.useEffect(() => {
    callbacksRef.current = {};
  }, [activePage]);

  // Memoize the virtual blocks array to prevent unnecessary re-renders
  const virtualBlocksRenders = useMemo(() => {
    const renders = [];
    for (const label in virtualBlocks) {
      renders.push(
        <VirtualBlock
          key={`${activePage} ${label}`}
          label={label}
          checkedObject={virtualBlocks[label]}
          setCheckedObject={getSetCheckedObject(label)}
          showVB={showVB}
          reader={reader}
          pageImageUrl={pageImageUrl}
        />
      );
    }
    return renders;
  }, [virtualBlocks, activePage, showVB, reader, getSetCheckedObject, pageImageUrl]);

  return (
    <div className={className}>
      {virtualBlocksRenders}
      {children}
    </div>
  );
});

VirtualBlocks.displayName = "VirtualBlocks";

export default VirtualBlocks;
