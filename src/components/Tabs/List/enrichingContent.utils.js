/**
 * Display name for an Enriching Content item (author or reader)
 * @param {string} type - "text" | "link" | "object"
 * @param {string} contentValue - HTML, URL or object ID
 * @returns {string}
 */
export const deriveEnrichingContentName = (type, contentValue) => {
  if (type === "text") {
    const plain = contentValue.replace(/<[^>]+>/g, "").trim();
    return plain.length > 40 ? plain.slice(0, 40) + "…" : plain || "Text item";
  }
  if (type === "link") return contentValue;
  if (type === "object") return contentValue;
  return "Enriching Content item";
};
