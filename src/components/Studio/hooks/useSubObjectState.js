import React from "react";
import { COMPLEX_TYPES } from "../../../utils/ocr";

/**
 * Hook for managing sub-object editing state
 * Used when editing nested/complex types within the Studio
 * @param {Object} params - Hook parameters
 * @param {string} [params.initialType] - Initial active type
 * @param {string} [params.initialTypeOfActiveType] - Initial type of active type
 * @returns {Object} Sub-object state and utilities
 */
const useSubObjectState = ({
  initialType = "",
  initialTypeOfActiveType = "",
} = {}) => {
  // The currently selected label/parameter being edited
  const [activeType, setActiveType] = React.useState(initialType);

  // The data type of the active type (e.g., "Text MCQ", "Image", etc.)
  const [typeOfActiveType, setTypeOfActiveType] = React.useState(
    initialTypeOfActiveType
  );

  // Track if we're currently in sub-object editing mode
  const [isEditing, setIsEditing] = React.useState(false);

  // Store the original context before entering sub-object editing
  const [editContext, setEditContext] = React.useState(null);

  /**
   * Check if currently editing a sub-object
   * @returns {boolean} True if in sub-object editing mode
   */
  const isEditingSubObject = React.useMemo(() => {
    return Boolean(activeType && typeOfActiveType);
  }, [activeType, typeOfActiveType]);

  /**
   * Check if the current type is a complex type
   * @returns {boolean} True if type is complex
   */
  const isComplexType = React.useMemo(() => {
    return COMPLEX_TYPES.includes(typeOfActiveType);
  }, [typeOfActiveType]);

  /**
   * Start editing a sub-object
   * @param {string} type - The type/label to edit
   * @param {string} typeOfType - The data type
   * @param {Object} [context] - Optional context to preserve
   */
  const startEditing = React.useCallback((type, typeOfType, context = null) => {
    setActiveType(type);
    setTypeOfActiveType(typeOfType);
    setIsEditing(true);
    if (context) {
      setEditContext(context);
    }
  }, []);

  /**
   * Clear sub-object editing state
   */
  const clearSubObject = React.useCallback(() => {
    setActiveType("");
    setTypeOfActiveType("");
    setIsEditing(false);
    setEditContext(null);
  }, []);

  /**
   * Update the active type
   * @param {string} type - New active type
   */
  const updateActiveType = React.useCallback((type) => {
    setActiveType(type);
  }, []);

  /**
   * Update the type of active type
   * @param {string} typeOfType - New type of active type
   */
  const updateTypeOfActiveType = React.useCallback((typeOfType) => {
    setTypeOfActiveType(typeOfType);
  }, []);

  /**
   * Set both type and type of active type together
   * @param {string} type - The type/label
   * @param {string} typeOfType - The data type
   */
  const setSubObjectType = React.useCallback((type, typeOfType) => {
    setActiveType(type);
    setTypeOfActiveType(typeOfType);
  }, []);

  /**
   * Get the current edit context
   * @returns {Object|null} The stored edit context
   */
  const getEditContext = React.useCallback(() => {
    return editContext;
  }, [editContext]);

  /**
   * Check if a specific type matches the current active type
   * @param {string} type - Type to check
   * @returns {boolean} True if types match
   */
  const isTypeActive = React.useCallback(
    (type) => {
      return activeType === type;
    },
    [activeType]
  );

  return {
    // State
    activeType,
    setActiveType,
    typeOfActiveType,
    setTypeOfActiveType,
    isEditing,
    editContext,

    // Computed
    isEditingSubObject,
    isComplexType,

    // Actions
    startEditing,
    clearSubObject,
    updateActiveType,
    updateTypeOfActiveType,
    setSubObjectType,
    getEditContext,

    // Utilities
    isTypeActive,
  };
};

export default useSubObjectState;
