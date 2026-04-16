import { useEffect, useRef } from "react";
import { simulatePollAutoGen } from "../services/autogen.simulator";

const POLL_INTERVAL_MS = 5000;

/**
 * Polls pending autogen content items every 5 s while the component is mounted.
 * Stops automatically when no items remain pending/processing.
 *
 * @param {Array} contents - Array of content items from VirtualBlockContentModal
 * @param {Function} onUpdate - Callback(index, patch) to apply a partial update to an item
 */
export function useAutoGenPolling(contents, onUpdate) {
  // Keep stable refs so the interval callback always sees the latest values
  const contentsRef = useRef(contents);
  contentsRef.current = contents;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const hasPending = contents.some(
      (item) =>
        item.type === "autogen" &&
        (item.status === "pending" || item.status === "processing")
    );

    if (!hasPending) return;

    const interval = setInterval(async () => {
      const current = contentsRef.current;

      const pendingItems = current
        .map((item, index) => ({ item, index }))
        .filter(
          ({ item }) =>
            item.type === "autogen" &&
            (item.status === "pending" || item.status === "processing")
        );

      for (const { item, index } of pendingItems) {
        try {
          const result = await simulatePollAutoGen(item.jobId);

          if (result.objectId) {
            // Completed — real API returns only { objectId }
            onUpdateRef.current(index, {
              status: "completed",
              objectId: result.objectId,
            });
          } else if (result.status === "failed") {
            onUpdateRef.current(index, {
              status: "failed",
              errorMessage: result.errorMessage || "Generation failed",
            });
          }
          // status === "processing" → do nothing, wait for next tick
        } catch (err) {
          onUpdateRef.current(index, {
            status: "failed",
            errorMessage: err.message || "Polling error",
          });
        }
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [contents]);
}
