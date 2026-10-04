import DOMPurify from "dompurify";

/**
 * Quill's "video" format emits an <iframe class="ql-video">, which is not in
 * DOMPurify's default tag list. srcdoc is deliberately not allowed through —
 * only src, which DOMPurify already vets against its URI regex (so javascript:
 * and friends are dropped).
 */
const CONFIG = {
  ADD_TAGS: ["iframe"],
  ADD_ATTR: ["allowfullscreen", "frameborder", "target"],
};

// Quill carries font, size, align and indent as ql-* classes rather than
// inline style, so class must survive sanitizing or the text loses formatting.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

/**
 * Sanitize Quill HTML for rendering via dangerouslySetInnerHTML.
 * @param {string} html - Untrusted HTML
 * @returns {string} Sanitized HTML, or "" for empty/non-string input
 */
export const sanitizeHtml = (html) => {
  if (typeof html !== "string" || !html) {
    return "";
  }
  return DOMPurify.sanitize(html, CONFIG);
};

/**
 * True when the HTML has no rendered content — Quill leaves "<p><br></p>"
 * behind for an editor the author opened and then cleared.
 * @param {string} html - HTML string
 * @returns {boolean}
 */
export const isEmptyHtml = (html) => {
  if (typeof html !== "string") {
    return true;
  }
  const withoutTags = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
  return withoutTags.trim() === "" && !/<(img|iframe)\b/i.test(html);
};
