import React from "react";
import { useQuery } from "@tanstack/react-query";

import { getObject } from "../../../api/bookapi";
import styles from "./deepBlockContent.module.scss";

/**
 * Renders a deep object block's linked interactive object inline as an iframe.
 * Fetches object.url from the API; shows a loading indicator while pending and
 * a text badge fallback if no URL is returned.
 *
 * @param {Object}  props
 * @param {string}  props.objectId    - The linked object's ID (from area.text)
 * @param {boolean} props.interactive - true in reader mode (pointer-events: auto)
 */
const DeepBlockObject = ({ objectId, interactive = false }) => {
  const { data: object, isLoading } = useQuery({
    queryKey: ["deep-object", objectId],
    queryFn: () => getObject(objectId),
    enabled: Boolean(objectId),
    staleTime: Infinity,
  });

  if (!objectId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={styles["deep-block-object-loading"]}>Loading…</div>
    );
  }

  if (!object?.url) {
    return (
      <div className={styles["deep-block-object"]}>Object linked</div>
    );
  }

  return (
    <iframe
      src={object.url}
      title="interactive-object"
      frameBorder="0"
      className={
        interactive
          ? styles["deep-block-object-iframe-interactive"]
          : styles["deep-block-object-iframe"]
      }
    />
  );
};

export default DeepBlockObject;
