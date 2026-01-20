/**
 * @file StudioWithContext.jsx
 * @description Wrapper component that provides Studio with context
 * Use this component when you want the full context-enabled Studio
 */

import React from "react";
import { StudioProvider } from "./context/StudioContext";
import Studio from "./Studio";

/**
 * Studio component wrapped with context provider
 * This is the recommended way to use Studio in new code
 *
 * @param {Object} props - All props are passed through to Studio
 * @returns {React.ReactElement} Studio wrapped with StudioProvider
 *
 * @example
 * // Use StudioWithContext instead of Studio directly
 * <StudioWithContext
 *   pages={pages}
 *   types={types}
 *   handleSubmit={handleSubmit}
 *   // ... other props
 * />
 */
const StudioWithContext = (props) => {
  return (
    <StudioProvider studioProps={props}>
      <Studio {...props} />
    </StudioProvider>
  );
};

export default StudioWithContext;
