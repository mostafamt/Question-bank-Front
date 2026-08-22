import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getObject } from "../../../api/bookapi";
import styles from "./deepBlockContent.module.scss";

/**
 * Renders a deep object block's linked interactive object inline as a
 * thumbnail image. Fetches object.url from the API; shows a loading
 * indicator while pending and a text badge fallback if no URL is returned.
 *
 * @param {Object}  props
 * @param {string}  props.objectId    - The linked object's ID (from area.text)
 */
const DeepBlockObject = ({ objectId }) => {
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

  // width/crop request a landscape capture (matching typical block areas)
  // instead of thum.io's default square-ish 600x1200 crop, and noanimate
  // skips thum.io's animated "still generating" placeholder so we always
  // get the final render instead of a mostly-blank loading frame — both of
  // which were the source of the large white space. See
  // https://www.thum.io/documentation/api/url#options
  const thumbnailUrl = `https://image.thum.io/get/width/1200/crop/400/noanimate/${object.url}`;

  return (
    <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <img
        src={thumbnailUrl}
        alt="thumbnail"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};

export default DeepBlockObject;
