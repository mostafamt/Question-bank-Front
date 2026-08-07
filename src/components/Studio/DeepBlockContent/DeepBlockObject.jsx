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

  const [showIframe, setShowIframe] = React.useState(false);

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

  const thumbnailUrl = `https://image.thum.io/get/${object.url}`;

  return (
    <div style={{ position: "relative", width: "100%", height: "400px" }}>
      {!showIframe && (
        <img
          src={thumbnailUrl}
          alt="thumbnail"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "pointer",
          }}
          onClick={() => setShowIframe(true)}
        />
      )}

      {showIframe && (
        <iframe
          src={object.url}
          title="content"
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      )}
    </div>
  );
};

export default DeepBlockObject;
