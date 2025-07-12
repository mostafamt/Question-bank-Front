import React from "react";
import Studio from "../../components/Studio/Studio";
import { useLocation, useParams } from "react-router-dom";
import { uploadBase64 } from "../../utils/upload";
import { saveBlocks } from "../../services/api";
import { getChapterPages, getTypes } from "../../api/bookapi";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress } from "@mui/material";

import styles from "./scanAndUpload.module.scss";
import { CREATED, DELETED, UPDATED } from "../../utils/ocr";

const ScanAndUpload = () => {
  const { bookId, chapterId } = useParams();
  const location = useLocation();
  const language = location.state?.language;

  const { data: types, isFetching: isFetchingTypes } = useQuery({
    queryKey: ["types"],
    queryFn: () => getTypes(),
    refetchOnWindowFocus: false,
  });

  const {
    data: pages,
    refetch,
    isFetching: isFetchingPages,
  } = useQuery({
    queryKey: [`book-${bookId}-chapter-${chapterId}`],
    queryFn: () => getChapterPages(chapterId),
    refetchOnWindowFocus: false,
  });

  const handleSubmit = async (pageId, areas, virtualBlocks) => {
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
                unit: "percentage",
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
                item.typeOfLabel === "image"
                  ? await uploadBase64(item.image)
                  : item.text,
            };
          }
        })
    );

    const v_blocks = [];
    for (const key in virtualBlocks) {
      const { label, id, status } = virtualBlocks[key];
      if (id) {
        v_blocks.push({
          pageId,
          status,
          iconLocation: key,
          contentType: label,
          contentValue: id,
        });
      }
    }

    const data = {
      blocks,
      v_blocks,
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
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default ScanAndUpload;
