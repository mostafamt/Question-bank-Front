import React from "react";
import Button from "@mui/material/Button";
import axios from "axios";
import Loader from "../../components/Loader/Loader";
import Studio from "../../components/Studio/Studio";
import { convertPdfToImages } from "../../utils/server";
import QuestionNameHeader from "../../components/QuestionNameHeader/QuestionNameHeader";
import { useStore } from "../../store/store";
import DescriptionIcon from "@mui/icons-material/Description";
import CollectionsIcon from "@mui/icons-material/Collections";
import VisuallyHiddenInput from "../../components/VisuallyHiddenInput/VisuallyHiddenInput";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import styles from "./scanAndUpload.module.scss";
import { uploadBase64 } from "../../utils/upload";
import { saveBlocks } from "../../services/api";
import { getChapterPages, getTypes } from "../../api/bookapi";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress } from "@mui/material";

const ScanAndUpload = () => {
  const { bookId, chapterId } = useParams();
  const [images, setImages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const { data: state, setFormState } = useStore();

  const {
    data: types,
    isError: isErrorTypes,
    isLoading: isLoadingTypes,
    isSuccess: isSuccessTypes,
    isFetching: isFetchingTypes,
  } = useQuery({
    queryKey: ["types"],
    queryFn: () => getTypes(),
  });

  const {
    data: pages,
    isError: isErrorPages,
    isLoading: isLoadingPages,
    isSuccess: isSuccessPages,
    isFetching: isFetchingPages,
  } = useQuery({
    queryKey: [`book-${bookId}-chapter-${chapterId}`],
    queryFn: () => getChapterPages(chapterId),
  });

  const handleSubmit = async (pageId, areas) => {
    const blocks = await Promise.all(
      [...areas]
        .sort((a, b) => a.order - b.order)
        .map(async (item) => ({
          pageId,
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
        }))
    );

    const data = {
      blocks,
    };

    const id = await saveBlocks(data);
    return id;
  };

  // if (isSuccessTypes) {
  //   setFormState({ ...state, types });
  // }

  return (
    <div className={`container ${styles["scan-and-upload"]}`}>
      {/* <QuestionNameHeader name={questionName} type={type} /> */}
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
        />
      )}
    </div>
  );
};

export default ScanAndUpload;
