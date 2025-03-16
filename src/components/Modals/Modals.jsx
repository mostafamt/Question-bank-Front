import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import Modal from "../Modal/Modal";
import { Button, CircularProgress } from "@mui/material";
import Select from "../Select/Select";
import { useForm } from "react-hook-form";
import { getBooks, getChapters } from "../../api";
import { useQuery } from "@tanstack/react-query";

import styles from "./modals.module.scss";

const Modals = (props) => {
  const { show, handleClose, setImages } = props;
  const [loadingScan, setLoadingScan] = React.useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();

  const {
    data: books,
    isError: isErrorBooks,
    isLoading: isLoadingBooks,
    isSuccess: isSuccessBooks,
  } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
  });

  const {
    data: chapters,
    isError: isErrorChapters,
    isLoading: isLoadingChapters,
    isSuccess: isSuccessChapters,
    isFetching,
  } = useQuery({
    queryKey: [`chapters-${watch("book")}`],
    queryFn: () => getChapters(watch("book")),
    enabled: !!watch("book"), // Disable auto-fetch
  });

  const onSubmit = async (values, event) => {
    console.log("values= ", values);
    console.log("onSubmit");
  };

  return (
    <Modal show={show} handleClose={handleClose}>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Upload a book chapter</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.row}>
            <Select
              label="Book"
              name="book"
              register={register}
              errors={errors}
              loading={isLoadingBooks}
            >
              {books?.map((book) => (
                <option key={book._id} value={book._id}>
                  {book.title}
                </option>
              ))}
            </Select>

            <Select
              label="Chapter"
              name="chapter"
              register={register}
              errors={errors}
              loading={isLoadingChapters}
            >
              {chapters?.map((chapter) => (
                <option key={chapter._id} value={chapter._id}>
                  {chapter.title}
                </option>
              ))}
            </Select>
          </div>

          <div
            className={styles.actions}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Button
              variant="contained"
              type="submit"
              disabled={loadingScan}
              startIcon={loadingScan ? <CircularProgress size="1rem" /> : <></>}
              name="author"
            >
              Submit
            </Button>
          </div>
        </form>
      </BootstrapModal.Body>
    </Modal>
  );
};

export default Modals;
