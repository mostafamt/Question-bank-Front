import React from "react";
import Studio from "../../components/Studio/Studio";
import { useLocation, useParams } from "react-router-dom";
import { uploadBase64 } from "../../utils/upload";
import { saveBlocks } from "../../services/api";
import { getChapterPages, getTypes } from "../../api/bookapi";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress } from "@mui/material";

import styles from "./scanAndUpload.module.scss";
import { CREATED, DELETED } from "../../utils/ocr";

const ScanAndUpload = () => {
  const { bookId, chapterId } = useParams();
  const location = useLocation();
  const language = location.state?.language;

  const { data: types, isFetching: isFetchingTypes } = useQuery({
    queryKey: ["types"],
    queryFn: () => getTypes(),
  });

  const { data: pages, isFetching: isFetchingPages } = useQuery({
    queryKey: [`book-${bookId}-chapter-${chapterId}`],
    queryFn: () => getChapterPages(chapterId),
  });

  const handleSubmit = async (pageId, areas) => {
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
                item.typeOfLabel === "image"
                  ? await uploadBase64(item.image)
                  : item.text,
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
              },
              contentType: item.label,
              contentValue:
                item.typeOfLabel === "image"
                  ? await uploadBase64(item.image)
                  : item.text,
            };
          } else {
            return {
              pageId,
              blockId: item.blockId,
              status: item.status,
              coordinates: {
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
              },
              contentType: item.label,
              contentValue:
                item.typeOfLabel === "image"
                  ? await uploadBase64(item.image)
                  : item.text,
            };
          }
        })
    );

    const data = {
      blocks,
    };

    const id = await saveBlocks(data);
    return id;
  };

  return (
    <div className={`container ${styles["scan-and-upload"]}`}>
      {isFetchingPages || isFetchingTypes ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress size="2rem" />
        </Box>
      ) : (
        <Studio
          types={types}
          pages={pages}
          type={"state.type"}
          handleSubmit={handleSubmit}
          language={language}
        />
      )}
    </div>
  );
};

export default ScanAndUpload;
