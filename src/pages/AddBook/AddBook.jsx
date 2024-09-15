import React from "react";
import { useForm } from "react-hook-form";
import Select from "../../components/Select/Select";
import {
  getBooks,
  getChapterPages,
  getChapters,
  getTestChapters,
} from "../../api/bookapi";
import { useQuery } from "@tanstack/react-query";
import { Button, CircularProgress } from "@mui/material";
import ScannerIcon from "@mui/icons-material/Scanner";

import styles from "./addBook.module.scss";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/store";
import { getTypes } from "../../services/api";

const AddBook = () => {
  const navigate = useNavigate();
  const { setFormState } = useStore();
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

  const onSubmit = async (values) => {
    const { chapter } = values;
    setLoadingScan(true);
    const data = await getChapterPages(chapter);

    const types = await getTypes();

    const selectedTypeObject = types.find((item) => item.typeName === "SI");

    console.log("types= ", types);
    console.log("labels= ", selectedTypeObject.labels);

    setFormState({
      type: selectedTypeObject,
      labels: selectedTypeObject.labels,
      types,
    });
    setLoadingScan(false);
    let images = data.map((item) => item.url);

    navigate("/scan-and-upload", { state: { key: "value", images } });
  };

  return (
    <div className={styles["add-book"]}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          <legend>Define Blocks</legend>
          <div>
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

            <div className={styles.actions}>
              <Button
                variant="contained"
                type="submit"
                disabled={loadingScan}
                startIcon={
                  loadingScan ? <CircularProgress size="1rem" /> : <></>
                }
              >
                Scan and Upload
              </Button>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default AddBook;
