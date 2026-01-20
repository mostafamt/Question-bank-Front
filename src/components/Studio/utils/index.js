/**
 * @file Studio Utils Index
 * @description Barrel export for all Studio-related utility functions
 */

// Area utilities (initialization, manipulation)
export {
  initializeAreas,
  initializeAreasProperties,
  initializeColorIndex,
  deleteAreaByIndex,
  addMetadataToAreas,
  getNextColor,
  incrementColorIndex,
} from "./areaUtils";

// Coordinate utilities (conversion, metadata)
export {
  percentageToPx,
  preserveAreaMetadata,
  resetUpdatedFlag,
  convertAreasForPage,
} from "./coordinateUtils";
