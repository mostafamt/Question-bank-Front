import React from "react";

import { sanitizeHtml, isEmptyHtml } from "../../../utils/sanitize";

import styles from "./deepBlockContent.module.scss";

/**
 * Paints a deep block's authored HTML over its area on the page, covering the
 * scanned content it replaces.
 * @param {Object} props
 * @param {string} props.html - The block's authored (untrusted) HTML
 */
const DeepBlockContent = ({ html }) => {
  const clean = React.useMemo(() => sanitizeHtml(html), [html]);

  if (isEmptyHtml(clean)) {
    return null;
  }

  return (
    <div
      className={styles["deep-block-content"]}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default DeepBlockContent;
