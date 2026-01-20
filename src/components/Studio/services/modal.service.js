/**
 * @file modal.service.js
 * @description Modal management service for Studio component
 * Centralizes modal opening logic and provides type-safe modal helpers
 *
 * This service works with the global Zustand store's modal system
 * and provides Studio-specific modal operations.
 */

/**
 * Modal names used in Studio component
 * @readonly
 * @enum {string}
 */
export const STUDIO_MODALS = {
  /** Modal for playing interactive objects */
  PLAY_OBJECT: "play-object-2",
  /** Modal for editing text with Quill editor */
  QUILL: "quill",
  /** Modal for editing sub-objects (nested complex types) */
  SUB_OBJECT: "sub-object",
  /** Modal for selecting composite blocks */
  COMPOSITE_BLOCKS: "composite-blocks-modal",
  /** Modal for playing composite blocks */
  PLAY_COMPOSITE_BLOCKS: "play-composite-blocks",
  /** Modal for editing composite blocks */
  EDIT_COMPOSITE_BLOCKS: "edit-composite-blocks",
};

/**
 * @typedef {Object} QuillModalProps
 * @property {Object} workingArea - The area being edited
 * @property {string} workingArea.blockId - Block ID
 * @property {string} workingArea.contentType - Content type
 * @property {string} workingArea.text - Text content
 * @property {string} workingArea.typeOfLabel - Type of label
 * @property {string} [workingArea.image] - Image content
 * @property {Function} updateAreaPropertyById - Callback to update area
 */

/**
 * @typedef {Object} SubObjectModalProps
 * @property {string} image - Image data URL
 * @property {string} type - Sub-object type
 * @property {Array} types - Available types
 * @property {Function} updateAreaProperty - Update callback
 * @property {string} typeOfActiveType - Active type
 */

/**
 * @typedef {Object} CompositeBlocksModalProps
 * @property {Function} onSelectObject - Callback when object is selected
 * @property {Array} pages - Pages array
 * @property {Array} areasProperties - Areas properties
 */

/**
 * Create props for opening Quill modal
 * @param {Object} params - Parameters
 * @param {string} params.blockId - Block ID
 * @param {string} params.contentType - Content type
 * @param {string} params.text - Text content
 * @param {string} params.typeOfLabel - Type of label
 * @param {string} [params.image] - Optional image
 * @param {Function} [params.updateAreaPropertyById] - Update callback
 * @returns {QuillModalProps} Modal props
 */
export function createQuillModalProps({
  blockId,
  contentType,
  text,
  typeOfLabel,
  image,
  updateAreaPropertyById = () => {},
}) {
  return {
    workingArea: {
      blockId,
      contentType,
      text,
      typeOfLabel,
      image,
    },
    updateAreaPropertyById,
  };
}

/**
 * Create props for opening Sub-Object modal
 * @param {Object} params - Parameters
 * @param {string} params.image - Image data URL
 * @param {string} params.type - Sub-object type
 * @param {Array} params.types - Available types
 * @param {Function} params.updateAreaProperty - Update callback
 * @param {string} params.typeOfActiveType - Active type
 * @returns {SubObjectModalProps} Modal props
 */
export function createSubObjectModalProps({
  image,
  type,
  types,
  updateAreaProperty,
  typeOfActiveType,
}) {
  return {
    image,
    type,
    types,
    updateAreaProperty,
    typeOfActiveType,
  };
}

/**
 * Create props for opening Composite Blocks modal
 * @param {Object} params - Parameters
 * @param {Function} params.onSelectObject - Selection callback
 * @param {Array} params.pages - Pages array
 * @param {Array} params.areasProperties - Areas properties
 * @returns {CompositeBlocksModalProps} Modal props
 */
export function createCompositeBlocksModalProps({
  onSelectObject,
  pages,
  areasProperties,
}) {
  return {
    onSelectObject,
    pages,
    areasProperties,
  };
}

/**
 * Modal service class for Studio component
 * Provides methods to open various modals with proper props
 */
export class StudioModalService {
  /**
   * @param {Function} openModal - The openModal function from Zustand store
   * @param {Function} setFormState - The setFormState function from Zustand store
   */
  constructor(openModal, setFormState) {
    this.openModal = openModal;
    this.setFormState = setFormState;
  }

  /**
   * Open the play object modal
   * @param {string} objectId - ID of the object to play
   */
  openPlayObjectModal(objectId) {
    this.setFormState({ activeId: objectId });
    this.openModal(STUDIO_MODALS.PLAY_OBJECT);
  }

  /**
   * Open the Quill text editor modal
   * @param {Object} areaProps - Area properties
   * @param {Function} [updateCallback] - Update callback
   */
  openQuillModal(areaProps, updateCallback = () => {}) {
    const props = createQuillModalProps({
      blockId: areaProps.blockId,
      contentType: areaProps.type,
      text: areaProps.text,
      typeOfLabel: areaProps.typeOfLabel,
      image: areaProps.image,
      updateAreaPropertyById: updateCallback,
    });
    this.openModal(STUDIO_MODALS.QUILL, props);
  }

  /**
   * Open the sub-object editing modal
   * @param {Object} params - Parameters
   * @param {string} params.image - Image data URL
   * @param {string} params.type - Object type
   * @param {Array} params.types - Available types
   * @param {Function} params.updateAreaProperty - Update callback
   * @param {string} params.typeOfActiveType - Active type
   */
  openSubObjectModal({ image, type, types, updateAreaProperty, typeOfActiveType }) {
    const props = createSubObjectModalProps({
      image,
      type,
      types,
      updateAreaProperty,
      typeOfActiveType,
    });
    this.openModal(STUDIO_MODALS.SUB_OBJECT, props);
  }

  /**
   * Open the composite blocks selection modal
   * @param {Object} params - Parameters
   * @param {Function} params.onSelectObject - Selection callback
   * @param {Array} params.pages - Pages array
   * @param {Array} params.areasProperties - Areas properties
   */
  openCompositeBlocksModal({ onSelectObject, pages, areasProperties }) {
    const props = createCompositeBlocksModalProps({
      onSelectObject,
      pages,
      areasProperties,
    });
    this.openModal(STUDIO_MODALS.COMPOSITE_BLOCKS, props);
  }

  /**
   * Open play composite blocks modal
   * @param {Object} compositeBlocks - Composite blocks data
   */
  openPlayCompositeBlocksModal(compositeBlocks) {
    this.openModal(STUDIO_MODALS.PLAY_COMPOSITE_BLOCKS, {
      compositeBlocks,
    });
  }

  /**
   * Open edit composite blocks modal
   * @param {Object} compositeBlocks - Composite blocks data
   * @param {Function} onSave - Save callback
   */
  openEditCompositeBlocksModal(compositeBlocks, onSave) {
    this.openModal(STUDIO_MODALS.EDIT_COMPOSITE_BLOCKS, {
      compositeBlocks,
      onSave,
    });
  }
}

/**
 * Create a modal service instance
 * @param {Function} openModal - openModal from store
 * @param {Function} setFormState - setFormState from store
 * @returns {StudioModalService} Modal service instance
 */
export function createModalService(openModal, setFormState) {
  return new StudioModalService(openModal, setFormState);
}

/**
 * Determine which modal to open based on area properties
 * @param {Object} areaProps - Area properties
 * @returns {{ modalName: string, isComplex: boolean }} Modal info
 */
export function determineModalForArea(areaProps) {
  if (!areaProps) {
    return { modalName: null, isComplex: false };
  }

  const isComplex =
    areaProps.type === "Question" || areaProps.type === "Illustrative Object";

  return {
    modalName: isComplex ? STUDIO_MODALS.PLAY_OBJECT : STUDIO_MODALS.QUILL,
    isComplex,
  };
}

export default {
  STUDIO_MODALS,
  createQuillModalProps,
  createSubObjectModalProps,
  createCompositeBlocksModalProps,
  createModalService,
  StudioModalService,
  determineModalForArea,
};
