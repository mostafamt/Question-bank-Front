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
import BookIcon from "@mui/icons-material/Book";
import VisuallyHiddenInput from "../../components/VisuallyHiddenInput/VisuallyHiddenInput";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import styles from "./scanAndUpload.module.scss";
import Modal from "../../components/Modal/Modal";
import ChooseBookModalContent from "../../components/Modal/ChooseBookModalContent/ChooseBookModalContent";
import { getChapterPages } from "../../api/bookapi";

const ScanAndUpload = () => {
  const location = useLocation();
  const [images, setImages] = React.useState(location.state?.images || []);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [showModal, setShowModal] = React.useState(false);

  const { data: state } = useStore();
  const { questionName, type } = state;

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

  const onChangeBook = async (event) => {
    console.log("onChangeBook");
    setShowModal(true);
  };

  const handleBookImport = async (chapterId) => {
    setLoading(true);
    try {
      const pages = await getChapterPages(chapterId);

      // Extract image URLs from pages
      const imageUrls = pages
        .map((page) => page.url || page.image || page)
        .filter((url) => url);

      if (imageUrls.length === 0) {
        toast.warning("This chapter has no images");
        return;
      }

      setImages(imageUrls);
      setShowModal(false);
      toast.success(`Imported ${imageUrls.length} pages`);
    } catch (error) {
      toast.error("Failed to import chapter");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <QuestionNameHeader>{state.type}</QuestionNameHeader>
        <Loader text="Converting pdf to images" />
      </div>
    );
  }

  return (
    <div className={`container ${styles["scan-and-upload"]}`}>
      <Modal size="xl" show={showModal} handleClose={() => setShowModal(false)}>
        <ChooseBookModalContent onImport={handleBookImport} />
      </Modal>
      <QuestionNameHeader name={questionName} type={type} />
      {!!images.length ? (
        <Studio
          images={images}
          setImages={setImages}
          questionName={state.questionName}
          type={state.type}
        />
      ) : (
        <div className={styles["upload-buttons"]}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<DescriptionIcon />}
            onChange={onChangePdf}
            color="warning"
          >
            Upload PDF
            <VisuallyHiddenInput type="file" accept="application/pdf" />
          </Button>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CollectionsIcon />}
            onChange={onChangeImages}
            color="success"
          >
            Upload images
            <VisuallyHiddenInput
              type="file"
              accept="image/png, image/jpeg"
              multiple
            />
          </Button>
          <Button
            component="label"
            variant="outlined"
            startIcon={<BookIcon />}
            onClick={onChangeBook}
            color="success"
          >
            import Book
          </Button>
        </div>
      )}
    </div>
  );
};

export default ScanAndUpload;
