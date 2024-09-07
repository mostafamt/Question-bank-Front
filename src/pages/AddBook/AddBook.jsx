import React from "react";
import { useForm } from "react-hook-form";
import Select from "../../components/Select/Select";
import { getBooks, getChapters, getTestChapters } from "../../api/bookapi";
import { useQuery } from "@tanstack/react-query";
import { Button, CircularProgress } from "@mui/material";
import ScannerIcon from "@mui/icons-material/Scanner";

import styles from "./addBook.module.scss";

const AddBook = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();

  const {
    data: books,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
  });

  //   const {
  //     data: chapters,
  //     isError: isErrorChapters,
  //     isLoading: isLoadingChapters,
  //     isSuccess: isSuccessChapters,
  //     isFetching,
  //   } = useQuery({
  //     queryKey: [`chapters-${watch("book")}`],
  //     queryFn: () => getChapters(watch("book")),
  //   });

  // TEST
  const {
    data: chapters,
    isError: isErrorChapters,
    isLoading: isLoadingChapters,
    isSuccess: isSuccessChapters,
    isFetching,
  } = useQuery({
    queryKey: [`chapters-${watch("book")}`],
    queryFn: () => getTestChapters(watch("book")),
  });

  console.log("chapters= ", chapters);

  const onSubmit = (values) => {
    console.log(values);
  };

  return (
    <div className={styles["add-book"]}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          <legend>Add Book</legend>
          <div>
            <div className={styles.row}>
              <Select
                label="Book"
                name="book"
                register={register}
                errors={errors}
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
              <Button variant="contained" type="submit">
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
