const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

/**
 * True when a block's content value is an interactive-object id (MongoDB ObjectId).
 * Blocks with such a value are played as interactive objects, whatever their contentType.
 * @param {*} value - Block contentValue (or area text)
 * @returns {boolean}
 */
export const isObjectId = (value) =>
  typeof value === "string" && OBJECT_ID_REGEX.test(value.trim());
