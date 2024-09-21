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
import { useTypes } from "../../utils/ocr";
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
  const types = useTypes();

  // const { data: state } = useStore();
  // const { questionName, type } = state;

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

  const handleSubmit = async (questionName, type, areas) => {
    const blocks = await Promise.all(
      [...areas]
        .sort((a, b) => a.order - b.order)
        .map(async (item) => ({
          pageId: "66e45a62435fef004a665159",
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

  const convertPdfToImage = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://34.246.140.123:5000/api/pdf2img",
        formData
      );
      setLoading(false);
      return res.data?.images;
    } catch (error) {
      toast.error("This service isn't available at the moment !");
      setLoading(false);
    }
  };

  const convertPdfToImage2 = async (file) => {
    setLoading(true);
    const res = await convertPdfToImages(file);
    setLoading(false);
    return res;
  };

  const onChangePdf = async (event) => {
    const file = event.target.files[0];
    const images = await convertPdfToImage(file);
    setImages(images ? images : []);
  };

  const onChangeImages = async (event) => {
    const files = event.target.files;
    const urls = [...files].map((file) => URL.createObjectURL(file));
    setImages(urls);
  };

  return (
    <div className={`container ${styles["scan-and-upload"]}`}>
      {/* <QuestionNameHeader name={questionName} type={type} /> */}
      {isFetchingPages ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress size="2rem" />
        </Box>
      ) : (
        <Studio
          images={pages.map((item) => item.url)}
          setImages={setImages}
          questionName={"state.questionName"}
          type={"state.type"}
          types={types}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default ScanAndUpload;
