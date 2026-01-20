/**
 * @file Studio Module Index
 * @description Main entry point for the Studio component and related exports
 */

// Main components
export { default as Studio } from "./Studio";
export { default as StudioWithContext } from "./StudioWithContext";

// Context
export { StudioProvider, useStudioContext } from "./context/StudioContext";

// Hooks (for advanced usage)
export {
  usePageNavigation,
  useAreaManagement,
  useCompositeBlocks,
  useVirtualBlocks,
  useStudioActions,
  useTabState,
  useLayoutState,
  useOCRSettings,
  useSubObjectState,
} from "./hooks";

// Services (business logic)
export * from "./services";

// Utils (pure functions)
export * from "./utils";

// Constants
export * from "./constants";

// Default export is the original Studio for backward compatibility
export { default } from "./Studio";
