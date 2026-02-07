/**
 * @file Studio Hooks Index
 * @description Barrel export for all Studio-related hooks
 */

// Page and navigation
export { default as usePageNavigation } from "./usePageNavigation";

// Area management
export { default as useAreaManagement } from "./useAreaManagement";

// Composite blocks
export { default as useCompositeBlocks } from "./useCompositeBlocks";

// Virtual blocks (educational content)
export { default as useVirtualBlocks } from "./useVirtualBlocks";

// Studio actions (highlighting, selection)
export { default as useStudioActions } from "./useStudioActions";

// Tab state management
export { default as useTabState } from "./useTabState";

// Layout state (zoom, sticky toolbar)
export { default as useLayoutState } from "./useLayoutState";

// OCR settings and operations
export { default as useOCRSettings } from "./useOCRSettings";

// Sub-object editing state
export { default as useSubObjectState } from "./useSubObjectState";

// Label management (OCR, coordinate extraction, sub-object modals)
export { default as useLabelManagement } from "./useLabelManagement";

// Block playback (reader mode)
export { default as usePlayBlock } from "./usePlayBlock";

// Column building and tab management
export { default as useStudioColumns } from "./useStudioColumns";

// General studio state (placeholder - may be removed)
export { default as useStudioState } from "./useStudioState";
