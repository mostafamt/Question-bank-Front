import React from "react";
import { useForm } from "react-hook-form";
import Select from "../../components/Select/Select";
import { getBooks, getChapters } from "../../api/bookapi";
import { useQuery } from "@tanstack/react-query";
import { Button, CircularProgress } from "@mui/material";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import DrawIcon from "@mui/icons-material/Draw";
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

  const { data: books, isLoading: isLoadingBooks } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
  });

  const { data: chapters, isLoading: isLoadingChapters } = useQuery({
    queryKey: [`chapters-${watch("book")}`],
    queryFn: () => getChapters(watch("book")),
    enabled: !!watch("book"), // Disable auto-fetch
  });

  const handleRead = ({ book, chapter }) => {
    navigate(`/read/book/${book}/chapter/${chapter}`);
  };

  const handleAuthor = async ({ book, chapter }) => {
    setLoadingScan(true);
    try {
      const types = await getTypes();
      setFormState({ types });

      const chapterDetails = chapters.find((c) => c._id === chapter);
      const language = chapterDetails?.language || "en";

      navigate(`/book/${book}/chapter/${chapter}`, { state: { language } });
    } finally {
      setLoadingScan(false);
    }
  };

  const onSubmit = async (values, event) => {
    const submitterName = event?.nativeEvent?.submitter?.name;

    if (submitterName === "read") {
      handleRead(values);
    } else {
      await handleAuthor(values);
    }
  };

  const renderButtonIcon = (type) => {
    if (type === "author") {
      return loadingScan ? <CircularProgress size="1rem" /> : <DrawIcon />;
    } else {
      return <ImportContactsIcon />;
    }
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
                startIcon={renderButtonIcon("author")}
                name="author"
              >
                Author
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={loadingScan}
                startIcon={renderButtonIcon("read")}
                name="read"
              >
                Read
              </Button>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default AddBook;
