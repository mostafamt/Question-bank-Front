import React from "react";
import Button from "@mui/material/Button";
import axios from "axios";
import Loader from "../../components/Loader/Loader";
import QuestionNameHeader from "../../components/QuestionNameHeader/QuestionNameHeader";
import DescriptionIcon from "@mui/icons-material/Description";
import CollectionsIcon from "@mui/icons-material/Collections";
import BookIcon from "@mui/icons-material/Book";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import VisuallyHiddenInput from "../../components/VisuallyHiddenInput/VisuallyHiddenInput";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../../components/Modal/Modal";
import ChooseBookModalContent from "../../components/Modal/ChooseBookModalContent/ChooseBookModalContent";
import { getChapterPages } from "../../api/bookapi";

import styles from "./uploadsPage.module.scss";

const UploadsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, type: locationtype, baseType, id } = location.state || {};
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  const goToStudio = (images) => {
    const destination = id ? `/studio/${id}` : "/studio";
    navigate(destination, {
      state: { images, questionName: name, type: baseType },
    });
  };

  const onSkip = () => {
    navigate(`/edit-question/${locationtype}/${baseType}/${id}`);
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

  const onChangePdf = async (event) => {
    const file = event.target.files[0];
    const images = await convertPdfToImage(file);
    if (images?.length) goToStudio(images);
  };

  const onChangeImages = async (event) => {
    const files = event.target.files;
    const urls = [...files].map((file) => URL.createObjectURL(file));
    if (urls.length) goToStudio(urls);
  };

  const onChangeBook = () => {
    setShowModal(true);
  };

  const handleBookImport = async (chapterId) => {
    setLoading(true);
    try {
      const pages = await getChapterPages(chapterId);

      const imageUrls = pages
        .map((page) => page.url || page.image || page)
        .filter((url) => url);

      if (imageUrls.length === 0) {
        toast.warning("This chapter has no images");
        return;
      }

      setShowModal(false);
      toast.success(`Imported ${imageUrls.length} pages`);
      goToStudio(imageUrls);
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
        <QuestionNameHeader name={name} type={locationtype} />
        <Loader text="Converting pdf to images" />
      </div>
    );
  }

  return (
    <div className={`container ${styles["uploads-page"]}`}>
      <Modal size="xl" show={showModal} handleClose={() => setShowModal(false)}>
        <ChooseBookModalContent onImport={handleBookImport} />
      </Modal>
      <QuestionNameHeader name={name} type={locationtype} />
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
        <Button
          variant="outlined"
          startIcon={<SkipNextIcon />}
          onClick={onSkip}
          color="secondary"
        >
          Skip
        </Button>
      </div>
    </div>
  );
};

export default UploadsPage;
