import React from "react";
import Studio from "../../components/Studio/Studio";
import { useLocation, useParams } from "react-router-dom";
import { uploadBase64ToCloudinary } from "../../services/cloudinary";
import { uploadPageImage } from "../../utils/NewUpload";
import { saveBlocks } from "../../services/api";
import {
  getChapterPages,
  getChapterPagesByLanguage,
  getCompositeTypes,
  getTypes,
} from "../../api/bookapi";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress } from "@mui/material";
import { formatVirtualBlocksForSubmission } from "../../utils/virtual-blocks";
import { useStore } from "../../store/store";
import { useAppMode } from "../../utils/tabFiltering";

import styles from "./scanAndUpload.module.scss";
import { CREATED, DELETED, UPDATED } from "../../utils/ocr";

const ScanAndUpload = () => {
  const { bookId, chapterId } = useParams();
  const location = useLocation();
  const language = location.state?.language;
  const setLanguage = useStore((s) => s.setLanguage);
  const mode = useAppMode();
  const isReaderMode = mode === "reader";
  // Reader-only: the language chosen on the Read button. Used solely to
  // query the pages endpoint below — never touches the navbar's layout
  // (RTL/LTR) language. Absent when the chapter has no language options,
  // in which case the query below omits the language filter entirely.
  const contentLanguage = location.state?.contentLanguage;
  const shouldQueryByLanguage = isReaderMode && Boolean(contentLanguage);
  const [pages, setPages] = React.useState([]);

  React.useEffect(() => {
    if (language) {
      setLanguage(language);
    }
  }, [language, setLanguage]);

  const { data: types, isFetching: isFetchingTypes } = useQuery({
    queryKey: ["types"],
    queryFn: () => getTypes(),
    refetchOnWindowFocus: false,
  });

  const { data: compositeBlocksTypes } = useQuery({
    queryKey: ["composite-types"],
    queryFn: () => getCompositeTypes(),
    refetchOnWindowFocus: false,
  });

  const {
    data: fetchedPages,
    refetch,
    isLoading: isLoadingPages,
  } = useQuery({
    queryKey: shouldQueryByLanguage
      ? [`book-${bookId}-chapter-${chapterId}`, contentLanguage]
      : [`book-${bookId}-chapter-${chapterId}`],
    queryFn: async () => {
      if (shouldQueryByLanguage) {
        const { pages: langPages } = await getChapterPagesByLanguage({
          chapterId,
          language: contentLanguage,
        });
        return langPages;
      }
      return getChapterPages(chapterId);
    },
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    if (fetchedPages) {
      setPages(fetchedPages);
    }
  }, [fetchedPages]);

  const handleSubmit = async (pageId, areas, virtualBlocks, pageSnapshot) => {
    const blocks = await Promise.all(
      [...areas]
        .sort((a, b) => a.order - b.order)
        .map(async (item) => {
          if (item.status === DELETED) {
            return {
              pageId,
              status: item.status,
              blockId: item.blockId,
              coordinates: {
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
              },
              contentType: item.label,
              contentValue:
                item.typeOfLabel === "image" ? item.image :
                item.typeOfLabel === "audio" ? item.audio :
                item.typeOfLabel === "video" ? item.video :
                item.text,
              isDeep: item.isDeep === true,
            };
          } else if (item.status === CREATED) {
            return {
              pageId,
              status: item.status,
              coordinates: {
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                unit: "percentage",
              },
              contentType: item.label,
              contentValue:
                item.typeOfLabel === "image"
                  ? item.image?.startsWith("data:")
                    ? (await uploadBase64ToCloudinary(item.image)).url // raw crop → upload it
                    : item.image // already a hosted URL (deep image) → use as-is
                  : item.typeOfLabel === "audio" ? item.audio :
                  item.typeOfLabel === "video" ? item.video :
                  item.text,
              isDeep: item.isDeep === true,
            };
          } else {
            return {
              pageId,
              blockId: item.blockId,
              status: UPDATED,
              coordinates: {
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                unit: "percentage",
              },
              contentType: item.label,
              contentValue:
                item.typeOfLabel === "image" ? item.image :
                item.typeOfLabel === "audio" ? item.audio :
                item.typeOfLabel === "video" ? item.video :
                item.text,
              isDeep: item.isDeep === true,
            };
          }
        })
    );

    // Format virtual blocks for submission using new structure
    const formattedVBlocks = formatVirtualBlocksForSubmission(
      virtualBlocks,
      pageId
    );

    // Upload page snapshot if provided (deep blocks present)
    const pageUrl = pageSnapshot
      ? await uploadPageImage(pageSnapshot, pageId)
      : null;

    // Only include v_blocks if there are any contents
    const data = {
      pageId,
      chapterId,
      ...(pageUrl && { pageUrl }),
      blocks,
      ...(formattedVBlocks && { v_blocks: [formattedVBlocks] }),
    };

    const id = await saveBlocks(data);
    return id;
  };

  return (
    <div className={`container ${styles["scan-and-upload"]}`}>
      {isLoadingPages || isFetchingTypes ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress size="2rem" />
        </Box>
      ) : (
        <Studio
          types={types}
          compositeBlocksTypes={compositeBlocksTypes}
          pages={pages}
          setPages={setPages}
          type={"state.type"}
          handleSubmit={handleSubmit}
          language={language}
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default ScanAndUpload;
