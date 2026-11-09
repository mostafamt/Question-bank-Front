import React from "react";

/**
 * Calls `minimize` whenever `navigationKey` changes (not on mount). Below
 * desktop a panel sheet covers the page, so picking a page or block inside it
 * (thumbnails, TOC, glossary…) should get out of the way to show the result.
 *
 * @param {string} navigationKey - Changes when the page/highlighted block changes
 * @param {Function} minimize - Hides the sheet
 */
const useMinimizeOnNavigate = (navigationKey, minimize) => {
  const previousKeyRef = React.useRef(navigationKey);
  const minimizeRef = React.useRef(minimize);

  React.useEffect(() => {
    minimizeRef.current = minimize;
  });

  React.useEffect(() => {
    if (previousKeyRef.current === navigationKey) return;
    previousKeyRef.current = navigationKey;
    minimizeRef.current?.();
  }, [navigationKey]);
};

export default useMinimizeOnNavigate;
